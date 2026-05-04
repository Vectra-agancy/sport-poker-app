export interface RatingRow {
  pos: number;
  name: string;
  bounties: number;
  points: number;
  change: number;
}

export type RatingScope = "global" | "season" | "friends";
