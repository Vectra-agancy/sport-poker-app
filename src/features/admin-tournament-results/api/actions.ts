"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/shared/api/prisma";
import { getCurrentUser } from "@/shared/lib/auth-helpers";
import { recomputeUserAchievements } from "@/entities/achievement/server";
import { recomputeReferralProgress } from "@/entities/user/server";
import { totalPoints } from "../lib/points";

export interface ResultInput {
  userId: number;
  attended: boolean;
  place: number | null;
  bounties: number;
}

export interface ActionResult {
  ok: boolean;
  error?: string;
}

export async function submitTournamentResults(
  tournamentId: number,
  inputs: ResultInput[],
  options: { markFinished: boolean }
): Promise<ActionResult> {
  const sessionUser = await getCurrentUser();
  if (!sessionUser || !sessionUser.isAdmin) {
    return { ok: false, error: "Доступ запрещён" };
  }

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    select: { id: true, type: true, maxSeats: true },
  });
  if (!tournament) return { ok: false, error: "Турнир не найден" };

  const attended = inputs.filter((i) => i.attended);
  const places = attended.map((a) => a.place);

  for (const a of attended) {
    if (a.place === null || !Number.isInteger(a.place) || a.place <= 0) {
      return {
        ok: false,
        error: "У всех пришедших должно быть указано целое место > 0",
      };
    }
  }
  const distinctPlaces = new Set(places);
  if (distinctPlaces.size !== places.length) {
    return { ok: false, error: "Места не должны повторяться" };
  }
  for (const i of inputs) {
    if (
      !Number.isInteger(i.bounties) ||
      i.bounties < 0
    ) {
      return {
        ok: false,
        error: "Баунти — неотрицательное целое число",
      };
    }
  }

  // Idempotent: wipe old results, then re-insert. Build the transaction
  // array via spread so Prisma infers the PrismaPromise union.
  await prisma.$transaction([
    prisma.tournamentResult.deleteMany({ where: { tournamentId } }),
    ...(attended.length > 0
      ? [
          prisma.tournamentResult.createMany({
            data: attended.map((r) => ({
              tournamentId,
              userId: r.userId,
              place: r.place as number,
              bountiesCount: r.bounties,
              pointsAwarded: totalPoints(
                r.place as number,
                r.bounties,
                tournament.maxSeats,
                tournament.type
              ),
            })),
          }),
        ]
      : []),
    ...inputs.map((i) =>
      prisma.registration.updateMany({
        where: {
          tournamentId,
          userId: i.userId,
          status: { not: "cancelled" },
        },
        data: { status: i.attended ? "attended" : "no_show" },
      })
    ),
    ...(options.markFinished
      ? [
          prisma.tournament.update({
            where: { id: tournamentId },
            data: { status: "finished" },
          }),
        ]
      : []),
  ]);

  await recomputeGlobalRating();

  // Re-evaluate auto-unlock achievements for everyone touched by this submit.
  // Achievements only ever go from locked → unlocked, so running for both
  // attended and no_show users is safe (no_show won't unlock anything new).
  const touchedUserIds = Array.from(
    new Set(inputs.map((i) => i.userId))
  );
  await Promise.all([
    ...touchedUserIds.map((uid) => recomputeUserAchievements(uid)),
    ...touchedUserIds.map((uid) => recomputeReferralProgress(uid)),
  ]);

  revalidatePath("/admin");
  revalidatePath(`/admin/tournaments/${tournamentId}/edit`);
  revalidatePath(`/admin/tournaments/${tournamentId}/results`);
  revalidatePath(`/tournament/${tournamentId}`);
  revalidatePath("/rating");
  revalidatePath("/profile");
  revalidatePath("/");
  return { ok: true };
}

async function recomputeGlobalRating(): Promise<void> {
  const results = await prisma.tournamentResult.findMany({
    select: { userId: true, pointsAwarded: true, bountiesCount: true },
  });

  const byUser = new Map<
    number,
    { points: number; bounties: number }
  >();
  for (const r of results) {
    const cur = byUser.get(r.userId) ?? { points: 0, bounties: 0 };
    cur.points += r.pointsAwarded;
    cur.bounties += r.bountiesCount;
    byUser.set(r.userId, cur);
  }
  if (byUser.size === 0) return;

  const sorted = [...byUser.entries()]
    .map(([userId, agg]) => ({ userId, ...agg }))
    .sort((a, b) => b.points - a.points || b.bounties - a.bounties);

  const takenAt = new Date();
  await prisma.ratingSnapshot.createMany({
    data: sorted.map((row, i) => ({
      userId: row.userId,
      scope: "global",
      position: i + 1,
      points: row.points,
      bounties: row.bounties,
      takenAt,
    })),
  });
}
