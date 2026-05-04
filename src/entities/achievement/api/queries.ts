import "server-only";
import { prisma } from "@/shared/api/prisma";
import type { Achievement, AchievementCategory } from "../model/types";

/**
 * Returns the full achievement catalog with `unlocked` flag (and optional date)
 * for the given user. Sort order is stable for UI grouping.
 */
export async function getAchievementsForUser(
  userId: number
): Promise<Achievement[]> {
  const [catalog, unlocked] = await Promise.all([
    prisma.achievement.findMany({ orderBy: { id: "asc" } }),
    prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true, unlockedAt: true },
    }),
  ]);

  const unlockedById = new Map(
    unlocked.map((u) => [u.achievementId, u.unlockedAt])
  );

  return catalog.map((a) => {
    const unlockedAt = unlockedById.get(a.id);
    return {
      id: a.id,
      code: a.code,
      icon: a.icon,
      title: a.title,
      desc: a.description,
      category: a.category as AchievementCategory,
      unlocked: Boolean(unlockedAt),
      date: unlockedAt
        ? unlockedAt.toISOString().slice(0, 10)
        : undefined,
    };
  });
}

export async function getAchievementCatalog(): Promise<Achievement[]> {
  const rows = await prisma.achievement.findMany({ orderBy: { id: "asc" } });
  return rows.map((a) => ({
    id: a.id,
    code: a.code,
    icon: a.icon,
    title: a.title,
    desc: a.description,
    category: a.category as AchievementCategory,
    unlocked: false,
  }));
}
