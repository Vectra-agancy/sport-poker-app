export type TournamentType =
  | "bounty"
  | "no_raise"
  | "amateur"
  | "freezeout";

export interface Tournament {
  id: number;
  name: string;
  type: TournamentType;
  seats: number;
  maxSeats: number;
  time: string;
  date: string;
  day: string;
  season: string;
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
