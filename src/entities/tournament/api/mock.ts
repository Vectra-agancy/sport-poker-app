import type { BlindLevel, Tournament } from "../model/types";

export const MOCK_TOURNAMENTS: Tournament[] = [
  {
    id: 1,
    name: "Ultra Bounty",
    type: "bounty",
    seats: 56,
    maxSeats: 60,
    time: "17:00",
    date: "2026-05-03",
    day: "Воскресенье",
    season: "Майский сезон",
    stack: 30000,
    ticket: 1500,
    guarantee: 90000,
  },
  {
    id: 2,
    name: "No raise",
    type: "no_raise",
    seats: 27,
    maxSeats: 60,
    time: "19:00",
    date: "2026-05-04",
    day: "Понедельник",
    season: "Майский сезон",
    stack: 25000,
    ticket: 1000,
  },
  {
    id: 3,
    name: "Amateur tournament",
    type: "amateur",
    seats: 6,
    maxSeats: 40,
    time: "19:00",
    date: "2026-05-05",
    day: "Вторник",
    season: "Майский сезон",
    stack: 20000,
    ticket: 800,
  },
  {
    id: 4,
    name: "Freezeout Classic",
    type: "freezeout",
    seats: 22,
    maxSeats: 50,
    time: "20:00",
    date: "2026-05-06",
    day: "Среда",
    season: "Майский сезон",
    stack: 35000,
    ticket: 1200,
  },
];

export const MOCK_BLIND_STRUCTURE: BlindLevel[] = [
  { lvl: 1, sb: 100, bb: 200, ante: 0, dur: 20 },
  { lvl: 2, sb: 200, bb: 400, ante: 50, dur: 20 },
  { lvl: 3, sb: 300, bb: 600, ante: 75, dur: 20 },
  { lvl: 4, sb: 500, bb: 1000, ante: 100, dur: 20 },
  { lvl: 5, sb: 0, bb: 0, ante: 0, dur: 10, isBreak: true },
  { lvl: 6, sb: 800, bb: 1600, ante: 200, dur: 20 },
  { lvl: 7, sb: 1200, bb: 2400, ante: 300, dur: 20 },
];

export const MOCK_PARTICIPANTS = [
  "SkyDiver",
  "Baber",
  "€$ LP",
  "Dmitry_archmeb",
  "Omarello57",
  "Feeleemon",
];

export function getTournamentById(id: number): Tournament | undefined {
  return MOCK_TOURNAMENTS.find((t) => t.id === id);
}
