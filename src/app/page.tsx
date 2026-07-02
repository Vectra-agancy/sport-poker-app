import { HomePage } from "@/views/home";
import { BottomNav } from "@/widgets/bottom-nav";
import { prisma } from "@/shared/api/prisma";
import { getCurrentUser } from "@/shared/lib/auth-helpers";
import {
  getMyUpcomingRegistrations,
  getUpcomingTournaments,
} from "@/entities/tournament/server";
import { getFriendsFeed, getRating } from "@/entities/rating/server";

export default async function Page() {
  const sessionUser = await getCurrentUser();
  const userId = sessionUser ? Number(sessionUser.id) : null;

  const [
    upcomingTournaments,
    topRating,
    myRegistrations,
    friendsFeed,
    playersCount,
    tournamentsCount,
  ] = await Promise.all([
    getUpcomingTournaments(3),
    getRating({ scope: "global", limit: 3 }),
    userId ? getMyUpcomingRegistrations(userId) : Promise.resolve([]),
    userId ? getFriendsFeed(userId, 5) : Promise.resolve([]),
    prisma.user.count(),
    prisma.tournament.count(),
  ]);

  return (
    <>
      <HomePage
        nickname={sessionUser?.nickname ?? null}
        upcomingTournaments={upcomingTournaments}
        myRegistrations={myRegistrations}
        topRating={topRating}
        friendsFeed={friendsFeed}
        clubStats={{ players: playersCount, tournaments: tournamentsCount }}
      />
      <BottomNav />
    </>
  );
}
