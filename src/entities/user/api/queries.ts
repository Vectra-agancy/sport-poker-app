import "server-only";
import { prisma } from "@/shared/api/prisma";
import type { CurrentUser, Tier, User } from "../model/types";

const ITM_PERCENTILE = 0.5; // top 50% = "in the money"

/**
 * Aggregates a user's profile including stats from rating snapshots and
 * tournament results. Returns null if the user does not exist.
 */
export async function getUserProfile(
  userId: number
): Promise<CurrentUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      nickname: true,
      avatarUrl: true,
      tier: true,
      email: true,
      freeTickets: true,
      _count: {
        select: {
          referrals: true,
          tournamentResults: true,
          registrations: { where: { status: "attended" } },
        },
      },
    },
  });
  if (!user) return null;

  // Latest global rating snapshot for points/position/bounties
  const latestSnapshot = await prisma.ratingSnapshot.findFirst({
    where: { userId, scope: "global" },
    orderBy: { takenAt: "desc" },
  });

  // Tournament results aggregates
  const results = await prisma.tournamentResult.findMany({
    where: { userId },
    include: { tournament: { select: { maxSeats: true } } },
  });

  const wins = results.filter((r) => r.place === 1).length;
  const topThreeFinishes = results.filter((r) => r.place <= 3).length;
  const itmCount = results.filter(
    (r) => r.place <= Math.max(1, Math.ceil(r.tournament.maxSeats * ITM_PERCENTILE))
  ).length;
  const averageFinish = results.length
    ? Number(
        (
          results.reduce((s, r) => s + r.place, 0) / results.length
        ).toFixed(1)
      )
    : 0;
  const itmPct = results.length
    ? Math.round((itmCount / results.length) * 100)
    : 0;

  // Aggregate referees attended games for the referral progress display
  const refProgress = await prisma.referralProgress.aggregate({
    where: { referrerId: userId },
    _sum: { attendedTournaments: true },
  });

  return {
    id: user.id,
    nickname: user.nickname,
    avatar: user.avatarUrl ?? undefined,
    tier: user.tier as CurrentUser["tier"],
    email: user.email ?? undefined,
    ratingPosition: latestSnapshot?.position ?? 0,
    points: latestSnapshot?.points ?? 0,
    bounties: latestSnapshot?.bounties ?? 0,
    tournaments: user._count.registrations,
    itm: itmPct,
    averageFinish,
    topThreeFinishes,
    wins,
    freeTickets: user.freeTickets,
    invitedCount: user._count.referrals,
    refereesGamesPlayed: refProgress._sum.attendedTournaments ?? 0,
  };
}

/**
 * Subset of User aggregates safe to expose on a public profile page —
 * no email, no referral counters, no free tickets.
 */
export type PublicUserProfile = User;

export async function getPublicProfileByNickname(
  nickname: string
): Promise<PublicUserProfile | null> {
  const user = await prisma.user.findUnique({
    where: { nickname },
    select: {
      id: true,
      nickname: true,
      avatarUrl: true,
      tier: true,
      _count: {
        select: {
          registrations: { where: { status: "attended" } },
        },
      },
    },
  });
  if (!user) return null;

  const latestSnapshot = await prisma.ratingSnapshot.findFirst({
    where: { userId: user.id, scope: "global" },
    orderBy: { takenAt: "desc" },
  });

  const results = await prisma.tournamentResult.findMany({
    where: { userId: user.id },
    include: { tournament: { select: { maxSeats: true } } },
  });

  const wins = results.filter((r) => r.place === 1).length;
  const topThreeFinishes = results.filter((r) => r.place <= 3).length;
  const itmCount = results.filter(
    (r) => r.place <= Math.max(1, Math.ceil(r.tournament.maxSeats * 0.5))
  ).length;
  const averageFinish = results.length
    ? Number(
        (
          results.reduce((s, r) => s + r.place, 0) / results.length
        ).toFixed(1)
      )
    : 0;
  const itmPct = results.length
    ? Math.round((itmCount / results.length) * 100)
    : 0;

  return {
    id: user.id,
    nickname: user.nickname,
    avatar: user.avatarUrl ?? undefined,
    tier: user.tier as Tier,
    ratingPosition: latestSnapshot?.position ?? 0,
    points: latestSnapshot?.points ?? 0,
    bounties: latestSnapshot?.bounties ?? 0,
    tournaments: user._count.registrations,
    itm: itmPct,
    averageFinish,
    topThreeFinishes,
    wins,
  };
}

export async function isFollowing(
  viewerId: number,
  targetUserId: number
): Promise<boolean> {
  if (viewerId === targetUserId) return false;
  const row = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: viewerId,
        followingId: targetUserId,
      },
    },
    select: { id: true },
  });
  return Boolean(row);
}

export async function getNeighborTarget(
  userId: number
): Promise<{ targetPosition: number; pointsGap: number } | null> {
  const my = await prisma.ratingSnapshot.findFirst({
    where: { userId, scope: "global" },
    orderBy: { takenAt: "desc" },
  });
  if (!my || my.position <= 1) return null;

  const ahead = await prisma.ratingSnapshot.findFirst({
    where: { scope: "global", position: my.position - 1 },
    orderBy: { takenAt: "desc" },
  });
  if (!ahead) return null;

  return {
    targetPosition: ahead.position,
    pointsGap: Math.max(0, ahead.points - my.points + 1),
  };
}
