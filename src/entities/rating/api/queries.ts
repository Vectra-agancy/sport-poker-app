import "server-only";
import { prisma } from "@/shared/api/prisma";
import type { RatingRow } from "../model/types";

/**
 * Returns the latest snapshot per user, sorted by position. Limited to `limit`.
 * For "friends" scope, restrict to users the given userId follows.
 */
export async function getRating(options: {
  scope: "global" | "season" | "friends";
  seasonId?: number | null;
  limit?: number;
  viewerId?: number;
}): Promise<RatingRow[]> {
  const limit = options.limit ?? 100;

  let userIdFilter: { in: number[] } | undefined;
  if (options.scope === "friends") {
    if (!options.viewerId) return [];
    const follows = await prisma.follow.findMany({
      where: { followerId: options.viewerId },
      select: { followingId: true },
    });
    if (follows.length === 0) return [];
    userIdFilter = { in: follows.map((f) => f.followingId) };
  }

  const dbScope = options.scope === "friends" ? "global" : options.scope;
  const seasonId =
    options.scope === "season" ? options.seasonId ?? undefined : undefined;

  // All rows in a single batch share a near-identical takenAt (the cron runs
  // once and writes everyone). Allow ±5 min slack when grouping into batches.
  const BATCH_TOLERANCE_MS = 5 * 60 * 1000;

  // 1. Find the latest batch's anchor timestamp for this scope.
  const latest = await prisma.ratingSnapshot.findFirst({
    where: {
      scope: dbScope,
      seasonId: seasonId ?? null,
      userId: userIdFilter,
    },
    orderBy: { takenAt: "desc" },
    select: { takenAt: true },
  });
  if (!latest) return [];

  const currentFloor = new Date(
    latest.takenAt.getTime() - BATCH_TOLERANCE_MS
  );

  // 2. Top-N rows from the latest batch only (avoids interleaving older batches).
  const rows = await prisma.ratingSnapshot.findMany({
    where: {
      scope: dbScope,
      seasonId: seasonId ?? null,
      userId: userIdFilter,
      takenAt: { gte: currentFloor },
    },
    orderBy: { position: "asc" },
    include: { user: { select: { nickname: true } } },
    take: limit,
  });
  if (rows.length === 0) return [];

  // 3. Find the previous batch (any snapshot strictly older than current floor)
  //    and pull positions for the same users to compute their change.
  const previousAnchor = await prisma.ratingSnapshot.findFirst({
    where: {
      scope: dbScope,
      seasonId: seasonId ?? null,
      takenAt: { lt: currentFloor },
    },
    orderBy: { takenAt: "desc" },
    select: { takenAt: true },
  });

  const previousMap = new Map<number, number>();
  if (previousAnchor) {
    const previousFloor = new Date(
      previousAnchor.takenAt.getTime() - BATCH_TOLERANCE_MS
    );
    const previousRows = await prisma.ratingSnapshot.findMany({
      where: {
        scope: dbScope,
        seasonId: seasonId ?? null,
        userId: { in: rows.map((r) => r.userId) },
        takenAt: { gte: previousFloor, lte: previousAnchor.takenAt },
      },
      select: { userId: true, position: true, takenAt: true },
      orderBy: { takenAt: "desc" },
    });
    for (const p of previousRows) {
      // Multiple rows for one user shouldn't happen within a batch, but if it
      // does, keep the most recent (sorted desc above).
      if (!previousMap.has(p.userId)) {
        previousMap.set(p.userId, p.position);
      }
    }
  }

  return rows.map((r) => {
    const prev = previousMap.get(r.userId);
    // change > 0 means position improved (lower number = higher rank).
    const change = prev !== undefined ? prev - r.position : 0;
    return {
      pos: r.position,
      name: r.user.nickname,
      bounties: r.bounties,
      points: r.points,
      change,
    };
  });
}

export interface FriendFeedItem {
  user: string;
  action: string;
  tournament?: string;
  achievement?: string;
  time: string;
  avatar: string;
}

function relativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const sec = Math.max(1, Math.floor(diffMs / 1000));
  if (sec < 60) return `${sec} сек назад`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} мин назад`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} ч назад`;
  const days = Math.floor(hr / 24);
  if (days < 30) return `${days} дн назад`;
  const months = Math.floor(days / 30);
  return `${months} мес назад`;
}

/**
 * Aggregates recent activity (achievements and tournament results) from
 * users the viewer follows. Sorted desc, capped to `limit` items.
 */
export async function getFriendsFeed(
  viewerId: number,
  limit = 10
): Promise<FriendFeedItem[]> {
  const follows = await prisma.follow.findMany({
    where: { followerId: viewerId },
    select: { followingId: true },
  });
  if (follows.length === 0) return [];
  const friendIds = follows.map((f) => f.followingId);

  const [achievements, results] = await Promise.all([
    prisma.userAchievement.findMany({
      where: { userId: { in: friendIds } },
      include: {
        user: { select: { nickname: true } },
        achievement: { select: { title: true } },
      },
      orderBy: { unlockedAt: "desc" },
      take: limit,
    }),
    prisma.tournamentResult.findMany({
      where: { userId: { in: friendIds } },
      include: {
        user: { select: { nickname: true } },
        tournament: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
  ]);

  const items: (FriendFeedItem & { sortAt: number })[] = [];

  for (const a of achievements) {
    items.push({
      user: a.user.nickname,
      action: "разблокировал",
      achievement: a.achievement.title,
      time: relativeTime(a.unlockedAt),
      avatar: a.user.nickname,
      sortAt: a.unlockedAt.getTime(),
    });
  }

  for (const r of results) {
    items.push({
      user: r.user.nickname,
      action:
        r.place === 1 ? "выиграл" : `занял ${r.place}-е место`,
      tournament: r.tournament.name,
      time: relativeTime(r.createdAt),
      avatar: r.user.nickname,
      sortAt: r.createdAt.getTime(),
    });
  }

  return items
    .sort((a, b) => b.sortAt - a.sortAt)
    .slice(0, limit)
    .map(({ sortAt: _sortAt, ...rest }) => rest);
}
