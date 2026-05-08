export type Tier = "bronze" | "silver" | "gold" | "platinum";

export interface User {
  id: number;
  nickname: string;
  avatar?: string;
  tier: Tier;
  ratingPosition: number;
  points: number;
  bounties: number;
  tournaments: number;
  itm: number;
  averageFinish: number;
  topThreeFinishes: number;
  wins: number;
  email?: string;
}

export interface CurrentUser extends User {
  freeTickets: number;
  invitedCount: number;
  refereesGamesPlayed: number;
  referralCode: string;
}
