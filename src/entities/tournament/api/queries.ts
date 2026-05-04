import "server-only";
import { prisma } from "@/shared/api/prisma";
import type {
  BlindLevel,
  MyRegistrationSummary,
  Tournament,
} from "../model/types";
import { blindLevelFromDb, tournamentFromDb } from "./mappers";

const REGISTERED_STATUSES = ["registered", "waitlist"];

export async function getUpcomingTournaments(
  limit = 10
): Promise<Tournament[]> {
  const rows = await prisma.tournament.findMany({
    where: {
      status: { in: ["scheduled", "in_progress"] },
      startsAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
    include: {
      season: true,
      _count: {
        select: {
          registrations: { where: { status: { in: REGISTERED_STATUSES } } },
        },
      },
    },
    orderBy: { startsAt: "asc" },
    take: limit,
  });
  return rows.map(tournamentFromDb);
}

export async function getAllTournaments(): Promise<Tournament[]> {
  const rows = await prisma.tournament.findMany({
    include: {
      season: true,
      _count: {
        select: {
          registrations: { where: { status: { in: REGISTERED_STATUSES } } },
        },
      },
    },
    orderBy: { startsAt: "asc" },
  });
  return rows.map(tournamentFromDb);
}

export async function getTournamentById(
  id: number
): Promise<Tournament | null> {
  const row = await prisma.tournament.findUnique({
    where: { id },
    include: {
      season: true,
      _count: {
        select: {
          registrations: { where: { status: { in: REGISTERED_STATUSES } } },
        },
      },
    },
  });
  return row ? tournamentFromDb(row) : null;
}

export async function getBlindStructure(
  tournamentId: number
): Promise<BlindLevel[]> {
  const rows = await prisma.tournamentLevel.findMany({
    where: { tournamentId },
    orderBy: { level: "asc" },
  });
  return rows.map(blindLevelFromDb);
}

export async function getTournamentParticipants(
  tournamentId: number
): Promise<string[]> {
  const rows = await prisma.registration.findMany({
    where: {
      tournamentId,
      status: { in: REGISTERED_STATUSES },
    },
    include: { user: { select: { nickname: true } } },
    orderBy: { createdAt: "asc" },
  });
  return rows.map((r) => r.user.nickname);
}

export async function getUserRegistrationOnTournament(
  userId: number,
  tournamentId: number
) {
  return prisma.registration.findUnique({
    where: { userId_tournamentId: { userId, tournamentId } },
  });
}

export async function getMyUpcomingRegistrations(
  userId: number
): Promise<MyRegistrationSummary[]> {
  const rows = await prisma.registration.findMany({
    where: {
      userId,
      status: { in: REGISTERED_STATUSES },
      tournament: { startsAt: { gte: new Date() } },
    },
    include: {
      tournament: { select: { id: true, name: true, startsAt: true } },
    },
    orderBy: { tournament: { startsAt: "asc" } },
  });
  return rows.map((r) => ({
    tournamentId: r.tournament.id,
    name: r.tournament.name,
    startsAt: r.tournament.startsAt,
    status: r.status,
  }));
}
