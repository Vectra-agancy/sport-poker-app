import type { Metadata } from "next";
import { ProfilePage, ProfilePageAnonymous } from "@/views/profile";
import { BottomNav } from "@/widgets/bottom-nav";
import { getCurrentUser } from "@/shared/lib/auth-helpers";
import {
  getUserProfile,
  getUserRatingHistory,
} from "@/entities/user/server";
import { getAchievementsForUser } from "@/entities/achievement/server";

export const metadata: Metadata = {
  title: "Профиль",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    return (
      <>
        <ProfilePageAnonymous />
        <BottomNav />
      </>
    );
  }

  const userId = Number(sessionUser.id);
  const [user, achievements, ratingHistory] = await Promise.all([
    getUserProfile(userId),
    getAchievementsForUser(userId),
    getUserRatingHistory(userId),
  ]);

  if (!user) {
    return (
      <>
        <ProfilePageAnonymous />
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <ProfilePage
        user={user}
        achievements={achievements}
        ratingHistory={ratingHistory}
        isAdmin={sessionUser.isAdmin}
      />
      <BottomNav />
    </>
  );
}
