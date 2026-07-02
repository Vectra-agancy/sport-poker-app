export type TournamentType =
  | "bounty"
  | "no_raise"
  | "amateur"
  | "freezeout";

export interface Tournament {
  id: number;
  name: string;
  type: TournamentType;
  status: string; // scheduled | in_progress | finished | cancelled
  seats: number;
  maxSeats: number;
  time: string;
  date: string; // человекочитаемая дата, например "10 мая"
  day: string;
  /** ISO-строка старта — для фильтров «предстоящие/прошедшие» и подобной логики */
  startsAtIso: string;
  season: string;
  location: string;
  format: string | null;
  stack: number;
  ticket: number;
  guarantee?: number;
}

export interface BlindLevel {
  lvl: number;
  sb: number;
  bb: number;
  ante: number;
  dur: number;
  isBreak?: boolean;
}

export interface TournamentTypeMeta {
  label: string;
  className: string;
}

export interface MyRegistrationSummary {
  tournamentId: number;
  name: string;
  startsAt: Date;
  status: string;
}
