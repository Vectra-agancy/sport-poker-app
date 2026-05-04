import type { CurrentUser } from "../model/types";

export const MOCK_CURRENT_USER: CurrentUser = {
  id: 1,
  nickname: "LuckNear",
  tier: "silver",
  ratingPosition: 45,
  points: 8240,
  bounties: 34,
  tournaments: 23,
  itm: 34,
  averageFinish: 8.2,
  topThreeFinishes: 5,
  wins: 2,
  freeTickets: 2,
  invitedCount: 7,
  refereesGamesPlayed: 23,
};

export const TIER_LABELS = {
  bronze: "Бронза",
  silver: "Серебро",
  gold: "Золото",
  platinum: "Платина",
} as const;
