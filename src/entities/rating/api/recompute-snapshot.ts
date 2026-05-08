import "server-only";
import { prisma } from "@/shared/api/prisma";

/**
 * Aggregates all TournamentResult rows into a fresh global RatingSnapshot
 * batch. Each call inserts a brand-new batch (positions 1..N) so the
 * dynamics arrows on /rating get a "previous" snapshot to compare against.
 *
 * Tie-break: higher points first, then higher bounties.
 */
export async function recomputeGlobalRating(): Promise<{ usersRanked: number }> {
  const results = await prisma.tournamentResult.findMany({
    select: { userId: true, pointsAwarded: true, bountiesCount: true },
  });

  const byUser = new Map<
    number,
    { points: number; bounties: number }
  >();
  for (const r of results) {
    const cur = byUser.get(r.userId) ?? { points: 0, bounties: 0 };
    cur.points += r.pointsAwarded;
    cur.bounties += r.bountiesCount;
    byUser.set(r.userId, cur);
  }
  if (byUser.size === 0) return { usersRanked: 0 };

  const sorted = [...byUser.entries()]
    .map(([userId, agg]) => ({ userId, ...agg }))
    .sort((a, b) => b.points - a.points || b.bounties - a.bounties);

  const takenAt = new Date();
  await prisma.ratingSnapshot.createMany({
    data: sorted.map((row, i) => ({
      userId: row.userId,
      scope: "global",
      position: i + 1,
      points: row.points,
      bounties: row.bounties,
      takenAt,
    })),
  });

  return { usersRanked: sorted.length };
}
