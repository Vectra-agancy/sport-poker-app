"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/shared/api/prisma";
import { getCurrentUser } from "@/shared/lib/auth-helpers";

// Approximate tournament window for overlap detection.
// Real durations vary by blind structure; refine per-tournament if needed.
const TOURNAMENT_DURATION_MIN = 4 * 60;
const ACTIVE_STATUSES = ["registered", "waitlist"];

export interface ActionResult {
  ok: boolean;
  error?: string;
  status?: "registered" | "waitlist";
}

interface ConflictInfo {
  tournamentName: string;
  startsAt: Date;
}

async function findOverlappingRegistration(
  userId: number,
  excludeTournamentId: number,
  startsAt: Date
): Promise<ConflictInfo | null> {
  const windowMs = TOURNAMENT_DURATION_MIN * 60_000;
  const targetEnd = new Date(startsAt.getTime() + windowMs);
  const earliest = new Date(startsAt.getTime() - windowMs);

  const conflict = await prisma.registration.findFirst({
    where: {
      userId,
      tournamentId: { not: excludeTournamentId },
      status: { in: ACTIVE_STATUSES },
      tournament: {
        status: { in: ["scheduled", "in_progress"] },
        startsAt: { gte: earliest, lte: targetEnd },
      },
    },
    include: {
      tournament: { select: { name: true, startsAt: true } },
    },
  });

  if (!conflict) return null;
  return {
    tournamentName: conflict.tournament.name,
    startsAt: conflict.tournament.startsAt,
  };
}

export interface RegisterOptions {
  useFreeTicket?: boolean;
}

export async function registerToTournament(
  tournamentId: number,
  options: RegisterOptions = {}
): Promise<ActionResult> {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) {
    return { ok: false, error: "Войдите, чтобы записаться" };
  }
  const userId = Number(sessionUser.id);

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    select: {
      id: true,
      name: true,
      startsAt: true,
      maxSeats: true,
      status: true,
    },
  });
  if (!tournament) return { ok: false, error: "Турнир не найден" };
  if (tournament.status === "cancelled") {
    return { ok: false, error: "Турнир отменён" };
  }
  if (tournament.startsAt.getTime() <= Date.now()) {
    return { ok: false, error: "Турнир уже начался" };
  }

  const existing = await prisma.registration.findUnique({
    where: { userId_tournamentId: { userId, tournamentId } },
  });
  if (existing && ACTIVE_STATUSES.includes(existing.status)) {
    return {
      ok: true,
      status: existing.status as "registered" | "waitlist",
    };
  }

  const conflict = await findOverlappingRegistration(
    userId,
    tournamentId,
    tournament.startsAt
  );
  if (conflict) {
    const time = `${pad(conflict.startsAt.getUTCHours())}:${pad(
      conflict.startsAt.getUTCMinutes()
    )}`;
    return {
      ok: false,
      error: `Пересечение по времени с «${conflict.tournamentName}» (${time})`,
    };
  }

  const registeredCount = await prisma.registration.count({
    where: { tournamentId, status: "registered" },
  });
  const nextStatus =
    registeredCount < tournament.maxSeats ? "registered" : "waitlist";

  const wantsFreeTicket = Boolean(options.useFreeTicket);

  try {
    await prisma.$transaction(async (tx) => {
      let usedFreeTicket = false;

      if (wantsFreeTicket) {
        // Re-read freshly inside the transaction to avoid double-spending
        // when the user has multiple tabs / fast clicks.
        const fresh = await tx.user.findUnique({
          where: { id: userId },
          select: { freeTickets: true },
        });
        if (!fresh || fresh.freeTickets <= 0) {
          throw new RegistrationError("NO_TICKET");
        }
        await tx.user.update({
          where: { id: userId },
          data: { freeTickets: { decrement: 1 } },
        });
        usedFreeTicket = true;
      }

      if (existing) {
        await tx.registration.update({
          where: { userId_tournamentId: { userId, tournamentId } },
          data: {
            status: nextStatus,
            cancelledAt: null,
            usedFreeTicket,
          },
        });
      } else {
        await tx.registration.create({
          data: {
            userId,
            tournamentId,
            status: nextStatus,
            usedFreeTicket,
          },
        });
      }
    });
  } catch (err) {
    if (err instanceof RegistrationError && err.code === "NO_TICKET") {
      return {
        ok: false,
        error: "Бесплатные билеты закончились",
      };
    }
    throw err;
  }

  revalidatePath(`/tournament/${tournamentId}`);
  revalidatePath("/profile");
  revalidatePath("/");
  return { ok: true, status: nextStatus };
}

export async function cancelRegistration(
  tournamentId: number
): Promise<ActionResult> {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) {
    return { ok: false, error: "Не авторизован" };
  }
  const userId = Number(sessionUser.id);

  const existing = await prisma.registration.findUnique({
    where: { userId_tournamentId: { userId, tournamentId } },
    include: {
      tournament: { select: { startsAt: true, status: true } },
    },
  });
  if (!existing) {
    return { ok: false, error: "Запись не найдена" };
  }
  if (!ACTIVE_STATUSES.includes(existing.status)) {
    return { ok: false, error: "Запись уже не активна" };
  }

  const wasRegistered = existing.status === "registered";
  const beforeStart = existing.tournament.startsAt.getTime() > Date.now();
  const refundTicket = existing.usedFreeTicket && beforeStart;

  await prisma.$transaction(async (tx) => {
    await tx.registration.update({
      where: { userId_tournamentId: { userId, tournamentId } },
      data: {
        status: "cancelled",
        cancelledAt: new Date(),
        // Clear the flag so a re-registration starts from a clean slate.
        usedFreeTicket: false,
      },
    });

    if (refundTicket) {
      await tx.user.update({
        where: { id: userId },
        data: { freeTickets: { increment: 1 } },
      });
    }

    if (wasRegistered && beforeStart) {
      const next = await tx.registration.findFirst({
        where: { tournamentId, status: "waitlist" },
        orderBy: { createdAt: "asc" },
      });
      if (next) {
        await tx.registration.update({
          where: { id: next.id },
          data: { status: "registered" },
        });
      }
    }
  });

  revalidatePath(`/tournament/${tournamentId}`);
  revalidatePath("/profile");
  revalidatePath("/");
  return { ok: true };
}

class RegistrationError extends Error {
  constructor(public code: "NO_TICKET") {
    super(code);
  }
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}
