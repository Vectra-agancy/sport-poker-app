import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PublicProfilePage } from "@/views/public-profile";
import { BottomNav } from "@/widgets/bottom-nav";
import { getCurrentUser } from "@/shared/lib/auth-helpers";
import {
  getPublicProfileByNickname,
  isFollowing,
} from "@/entities/user/server";
import { getAchievementsForUser } from "@/entities/achievement/server";

interface PageProps {
  params: { nickname: string };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const nickname = decodeURIComponent(params.nickname);
  const user = await getPublicProfileByNickname(nickname);
  if (!user) return { title: "Профиль" };
  const description =
    user.ratingPosition > 0
      ? `${user.nickname} · #${user.ratingPosition} в рейтинге · ${user.points.toLocaleString("ru-RU")} очков.`
      : `${user.nickname} в RERAISE CLUB.`;
  return {
    title: user.nickname,
    description,
    openGraph: {
      title: `${user.nickname} · RERAISE CLUB`,
      description,
      type: "profile",
    },
    twitter: {
      card: "summary",
      title: `${user.nickname} · RERAISE CLUB`,
      description,
    },
  };
}

export default async function Page({ params }: PageProps) {
  const nickname = decodeURIComponent(params.nickname);

  const sessionUser = await getCurrentUser();
  // If viewer is looking at their own page, send them to /profile
  if (sessionUser && sessionUser.nickname === nickname) {
    redirect("/profile");
  }

  const user = await getPublicProfileByNickname(nickname);
  if (!user) notFound();

  const viewerId = sessionUser ? Number(sessionUser.id) : null;
  // null = follow button hidden (self or unauthenticated)
  const followState =
    viewerId === null
      ? null
      : await isFollowing(viewerId, user.id);

  const achievements = await getAchievementsForUser(user.id);

  return (
    <>
      <PublicProfilePage
        user={user}
        achievements={achievements}
        isFollowing={followState}
      />
      <BottomNav />
    </>
  );
}
