import type { TournamentType } from "@/entities/tournament";

export interface TournamentLevelInput {
  level: number;
  smallBlind: number;
  bigBlind: number;
  ante: number;
  durationMin: number;
  isBreak: boolean;
}

export interface TournamentFormValues {
  name: string;
  type: TournamentType;
  startsAt: string; // datetime-local string, e.g. "2026-05-10T17:00"
  location: string;
  maxSeats: number;
  startStack: number;
  ticketPrice: number;
  guarantee: number | null;
  format: string | null;
  seasonId: number | null;
  levels: TournamentLevelInput[];
}
