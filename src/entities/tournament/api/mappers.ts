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

const MONTH_GENITIVE = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function formatDate(d: Date): string {
  // Use UTC components to keep deterministic across runtime timezones
  return `${d.getUTCDate()} ${MONTH_GENITIVE[d.getUTCMonth()]}`;
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
    status: row.status,
    seats: row._count.registrations,
    maxSeats: row.maxSeats,
    time: formatTime(row.startsAt),
    date: formatDate(row.startsAt),
    day: DAY_NAMES[row.startsAt.getUTCDay()],
    startsAtIso: row.startsAt.toISOString(),
    season: row.season?.name ?? "",
    location: row.location,
    format: row.format,
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
