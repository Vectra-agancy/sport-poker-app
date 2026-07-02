"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/shared/api/prisma";
import { getCurrentUser } from "@/shared/lib/auth-helpers";

const REG_STATUSES = [
  "registered",
  "waitlist",
  "attended",
  "cancelled",
  "no_show",
] as const;

type RegStatus = (typeof REG_STATUSES)[number];

export interface ActionResult {
  ok: boolean;
  error?: string;
}

async function ensureAdmin() {
  const user = await getCurrentUser();
  if (!user || !user.isAdmin) return null;
  return user;
}

function revalidateTournament(tournamentId: number) {
  revalidatePath(`/admin/tournaments/${tournamentId}/registrations`);
  revalidatePath(`/admin/tournaments/${tournamentId}/results`);
  revalidatePath(`/tournament/${tournamentId}`);
  revalidatePath("/admin/tournaments");
  revalidatePath("/");
}

export async function setRegistrationStatus(
  registrationId: number,
  status: string
): Promise<ActionResult> {
  const admin = await ensureAdmin();
  if (!admin) return { ok: false, error: "Доступ запрещён" };
  if (!REG_STATUSES.includes(status as RegStatus)) {
    return { ok: false, error: "Неверный статус" };
  }

  const registration = await prisma.registration.update({
    where: { id: registrationId },
    data: {
      status,
      cancelledAt: status === "cancelled" ? new Date() : null,
    },
    select: { tournamentId: true },
  });

  revalidateTournament(registration.tournamentId);
  return { ok: true };
}

export async function removeRegistration(
  registrationId: number
): Promise<ActionResult> {
  const admin = await ensureAdmin();
  if (!admin) return { ok: false, error: "Доступ запрещён" };

  const registration = await prisma.registration.delete({
    where: { id: registrationId },
    select: { tournamentId: true },
  });

  revalidateTournament(registration.tournamentId);
  return { ok: true };
}

export async function addRegistration(
  tournamentId: number,
  userId: number
): Promise<ActionResult> {
  const admin = await ensureAdmin();
  if (!admin) return { ok: false, error: "Доступ запрещён" };

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    select: { id: true },
  });
  if (!tournament) return { ok: false, error: "Турнир не найден" };

  await prisma.registration.upsert({
    where: { userId_tournamentId: { userId, tournamentId } },
    create: { userId, tournamentId, status: "registered" },
    update: { status: "registered", cancelledAt: null },
  });

  revalidateTournament(tournamentId);
  return { ok: true };
}

export interface PlayerSearchItem {
  id: number;
  nickname: string;
}

/**
 * Игроки по нику/email, которых ещё нет в активных регистрациях турнира
 * (отменённые можно вернуть — они не исключаются на уровне upsert).
 */
export async function searchPlayersToAdd(
  tournamentId: number,
  query: string
): Promise<PlayerSearchItem[]> {
  const admin = await ensureAdmin();
  if (!admin) return [];

  const q = query.trim();
  if (q.length < 2) return [];

  return prisma.user.findMany({
    where: {
      OR: [{ nickname: { contains: q } }, { email: { contains: q } }],
      registrations: {
        none: { tournamentId, status: { not: "cancelled" } },
      },
    },
    select: { id: true, nickname: true },
    orderBy: { nickname: "asc" },
    take: 10,
  });
}
