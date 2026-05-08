import { Header } from "@/widgets/header";
import { AchievementsGrid } from "@/widgets/achievements-grid";
import { FollowButton } from "@/features/follow-user";
import type { Achievement } from "@/entities/achievement";
import { TIER_LABELS, UserAvatar } from "@/entities/user";
import type { PublicUserProfile } from "@/entities/user/server";

export interface PublicProfilePageProps {
  user: PublicUserProfile;
  achievements: Achievement[];
  /** null = viewer is the same user or unauthenticated, hide follow button */
  isFollowing: boolean | null;
}

export function PublicProfilePage({
  user,
  achievements,
  isFollowing,
}: PublicProfilePageProps) {
  return (
    <div className="pb-28">
      <Header title="Профиль" showBack />
      <div className="px-4 space-y-4">
        <div className="rounded-2xl bg-gradient-to-br from-burgundy-700 to-burgundy-800 border border-amber-900/30 p-5">
          <div className="flex items-center gap-4 mb-5">
            <UserAvatar name={user.nickname} size="xl" />
            <div className="flex-1 min-w-0">
              <div className="text-white font-bold text-xl truncate">
                {user.nickname}
              </div>
              <div className="text-amber-200/60 text-sm">
                {TIER_LABELS[user.tier]}
                {user.ratingPosition > 0 &&
                  ` • #${user.ratingPosition} в рейтинге`}
              </div>
            </div>
          </div>

          {isFollowing !== null && (
            <div className="mb-4">
              <FollowButton
                targetUserId={user.id}
                initialIsFollowing={isFollowing}
              />
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 mb-2">
            {[
              { label: "Очки", value: user.points.toLocaleString() },
              { label: "Баунти", value: user.bounties.toString() },
              { label: "Турниров", value: user.tournaments.toString() },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl bg-burgundy-900/60 border border-amber-900/20 p-3 text-center"
              >
                <div className="text-white font-bold text-xl">{s.value}</div>
                <div className="text-xs text-amber-200/50 uppercase tracking-wider mt-0.5">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "ITM%", value: `${user.itm}%` },
              { label: "Среднее место", value: user.averageFinish.toString() },
              { label: "Топ-3 финиши", value: user.topThreeFinishes.toString() },
              { label: "Победы", value: user.wins.toString() },
            ].map((s) => (
              <div
                key={s.label}
                className="flex items-center justify-between rounded-xl bg-burgundy-900/40 border border-amber-900/10 px-3 py-2"
              >
                <span className="text-amber-200/60 text-xs">{s.label}</span>
                <span className="text-white font-bold">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        <AchievementsGrid achievements={achievements} />
      </div>
    </div>
  );
}
