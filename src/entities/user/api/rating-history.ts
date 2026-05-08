import "server-only";
import { prisma } from "@/shared/api/prisma";

export interface RatingHistoryPoint {
  /** ISO date string yyyy-mm-dd. */
  date: string;
  points: number;
}

export interface RatingHistory {
  points: RatingHistoryPoint[];
  /** Net change between first and last point in the window. */
  delta: number;
  /** Human-friendly label for the window, e.g. "30 дней". */
  rangeLabel: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Returns a per-day points history for the user over the last `days` days.
 * Multiple snapshots in a day collapse to the most recent. If no snapshots
 * exist in the window, returns an empty series with delta=0.
 */
export async function getUserRatingHistory(
  userId: number,
  days = 30
): Promise<RatingHistory> {
  const cutoff = new Date(Date.now() - days * DAY_MS);
  const snapshots = await prisma.ratingSnapshot.findMany({
    where: { userId, scope: "global", takenAt: { gte: cutoff } },
    orderBy: { takenAt: "asc" },
    select: { takenAt: true, points: true },
  });

  // Collapse to one point per day, keeping the latest takenAt for that day.
  const byDay = new Map<string, number>();
  for (const s of snapshots) {
    const day = s.takenAt.toISOString().slice(0, 10);
    byDay.set(day, s.points);
  }

  const points: RatingHistoryPoint[] = [...byDay.entries()].map(
    ([date, value]) => ({ date, points: value })
  );

  const delta =
    points.length >= 2
      ? points[points.length - 1].points - points[0].points
      : 0;

  return {
    points,
    delta,
    rangeLabel: `${days} дней`,
  };
}
