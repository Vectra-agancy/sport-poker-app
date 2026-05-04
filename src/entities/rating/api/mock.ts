import type { RatingRow } from "../model/types";

export const MOCK_RATING: RatingRow[] = [
  { pos: 1, name: "V", bounties: 61, points: 31045, change: 0 },
  { pos: 2, name: "ИзЯ", bounties: 112, points: 30414, change: 1 },
  { pos: 3, name: "VagabOnd", bounties: 72, points: 28445, change: -1 },
  { pos: 4, name: "s1eepz", bounties: 88, points: 26200, change: 2 },
  { pos: 5, name: "Олег Вла", bounties: 110, points: 23981, change: 0 },
  { pos: 6, name: "SkyDiver", bounties: 45, points: 22100, change: 3 },
  { pos: 7, name: "Baber", bounties: 67, points: 21500, change: -2 },
];

export interface FriendFeedItem {
  user: string;
  action: string;
  tournament?: string;
  achievement?: string;
  time: string;
  avatar: string;
}

export const MOCK_FRIENDS_FEED: FriendFeedItem[] = [
  {
    user: "VagabOnd",
    action: "занял 2-е место",
    tournament: "Ultra Bounty",
    time: "2 часа назад",
    avatar: "V",
  },
  {
    user: "ИзЯ",
    action: "выиграл",
    tournament: "No raise",
    time: "1 день назад",
    avatar: "И",
  },
  {
    user: "s1eepz",
    action: "разблокировал",
    achievement: "Royal Flush",
    time: "2 дня назад",
    avatar: "S",
  },
];
