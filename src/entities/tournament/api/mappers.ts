import "server-only";
import type {
  Tournament as PrismaTournament,
  TournamentLevel as PrismaTournamentLevel,
  Season as PrismaSeason,
} from "@/generated/prisma/client";
import type {
  BlindLevel,
  Tournament,
  TournamentType,
} from "../model/types";

const DAY_NAMES = [
  "Воскресенье",
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
];

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function formatDate(d: Date): string {
  // Use UTC components to keep deterministic across runtime timezones
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

function formatTime(d: Date): string {
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

export type TournamentDbRow = PrismaTournament & {
  season: PrismaSeason | null;
  _count: { registrations: number };
};

export function tournamentFromDb(row: TournamentDbRow): Tournament {
  return {
    id: row.id,
    name: row.name,
    type: row.type as TournamentType,
    seats: row._count.registrations,
    maxSeats: row.maxSeats,
    time: formatTime(row.startsAt),
    date: formatDate(row.startsAt),
    day: DAY_NAMES[row.startsAt.getUTCDay()],
    season: row.season?.name ?? "",
    stack: row.startStack,
    ticket: row.ticketPrice,
    guarantee: row.guarantee ?? undefined,
  };
}

export function blindLevelFromDb(row: PrismaTournamentLevel): BlindLevel {
  return {
    lvl: row.level,
    sb: row.smallBlind,
    bb: row.bigBlind,
    ante: row.ante,
    dur: row.durationMin,
    isBreak: row.isBreak,
  };
}
