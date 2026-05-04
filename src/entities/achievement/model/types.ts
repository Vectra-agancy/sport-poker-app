export type AchievementCategory = "rare" | "result" | "participation";

export interface Achievement {
  id: number;
  code: string;
  icon: string;
  title: string;
  desc: string;
  category: AchievementCategory;
  unlocked: boolean;
  date?: string;
}
