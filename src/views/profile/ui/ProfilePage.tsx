import { Header } from "@/widgets/header";
import { AchievementsGrid } from "@/widgets/achievements-grid";
import { ReferralCard } from "@/widgets/referral-card";
import { RatingChart } from "@/widgets/rating-chart";
import { BindEmailForm } from "@/features/bind-email";
import { MOCK_ACHIEVEMENTS } from "@/entities/achievement";
import { MOCK_CURRENT_USER, TIER_LABELS, UserAvatar } from "@/entities/user";

export function ProfilePage() {
  const user = MOCK_CURRENT_USER;
  return (
    <div className="pb-28">
      <Header title="Профиль" />
      <div className="px-4 space-y-4">
        <div className="rounded-2xl bg-gradient-to-br from-burgundy-700 to-burgundy-800 border border-amber-900/30 p-5">
          <div className="flex items-center gap-4 mb-5">
            <UserAvatar name={user.nickname} size="xl" />
            <div className="flex-1">
              <div className="text-white font-bold text-xl">
                {user.nickname}
              </div>
              <div className="text-amber-200/60 text-sm">
                {TIER_LABELS[user.tier]} • #{user.ratingPosition} в рейтинге
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
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
              { label: "Среднее место", value: `${user.averageFinish}` },
              { label: "Топ-3 финиши", value: `${user.topThreeFinishes}` },
              { label: "Победы", value: `${user.wins}` },
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

        <RatingChart delta={340} rangeLabel="30 дней" />
        <AchievementsGrid achievements={MOCK_ACHIEVEMENTS} />
        <ReferralCard
          user={{
            freeTickets: user.freeTickets,
            invitedCount: user.invitedCount,
            refereesGamesPlayed: user.refereesGamesPlayed,
          }}
        />
        <BindEmailForm />
      </div>
    </div>
  );
}
