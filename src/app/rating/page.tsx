import type { Metadata } from "next";
import { RatingPage } from "@/views/rating";
import { BottomNav } from "@/widgets/bottom-nav";
import { getRating } from "@/entities/rating/server";
import type { RatingScope } from "@/entities/rating";
import { getCurrentUser } from "@/shared/lib/auth-helpers";
import { getNeighborTarget } from "@/entities/user/server";
import { prisma } from "@/shared/api/prisma";

export const metadata: Metadata = {
  title: "Рейтинг",
  description: "Глобальный рейтинг игроков RERAISE CLUB по очкам и баунти.",
};

interface PageProps {
  searchParams: { scope?: string };
}

const VALID_SCOPES: RatingScope[] = ["global", "season", "friends"];

export default async function Page({ searchParams }: PageProps) {
  const scopeParam = searchParams.scope;
  const scope: RatingScope = VALID_SCOPES.includes(scopeParam as RatingScope)
    ? (scopeParam as RatingScope)
    : "global";

  const sessionUser = await getCurrentUser();
  const viewerId = sessionUser ? Number(sessionUser.id) : undefined;

  let activeSeasonId: number | null = null;
  if (scope === "season") {
    const active = await prisma.season.findFirst({
      where: { isActive: true },
      select: { id: true },
    });
    activeSeasonId = active?.id ?? null;
  }

  const rows = await getRating({
    scope,
    seasonId: activeSeasonId,
    viewerId,
    limit: 100,
  });

  let myPosition: { position: number; targetPosition?: number; pointsGap?: number } | null = null;
  if (viewerId) {
    const snap = await prisma.ratingSnapshot.findFirst({
      where: { userId: viewerId, scope: "global" },
      orderBy: { takenAt: "desc" },
    });
    if (snap) {
      const neighbor = await getNeighborTarget(viewerId);
      myPosition = {
        position: snap.position,
        targetPosition: neighbor?.targetPosition,
        pointsGap: neighbor?.pointsGap,
      };
    }
  }

  return (
    <>
      <RatingPage rows={rows} activeScope={scope} myPosition={myPosition} />
      <BottomNav />
    </>
  );
}
