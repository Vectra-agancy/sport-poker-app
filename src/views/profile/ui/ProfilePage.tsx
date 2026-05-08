import Link from "next/link";
import { Shield } from "lucide-react";
import { Header } from "@/widgets/header";
import { AchievementsGrid } from "@/widgets/achievements-grid";
import { ReferralCard } from "@/widgets/referral-card";
import { RatingChart } from "@/widgets/rating-chart";
import { BindEmailForm } from "@/features/bind-email";
import { ChangeNicknameDialog } from "@/features/change-nickname";
import { NotificationSettings } from "@/features/notification-settings";
import type { Achievement } from "@/entities/achievement";
import { TIER_LABELS, UserAvatar, type CurrentUser } from "@/entities/user";
import type { RatingHistory } from "@/entities/user/server";

export interface ProfilePageProps {
  user: CurrentUser;
  achievements: Achievement[];
  ratingHistory: RatingHistory;
  isAdmin?: boolean;
}

export function ProfilePage({
  user,
  achievements,
  ratingHistory,
  isAdmin,
}: ProfilePageProps) {
  return (
    <div className="pb-28">
      <Header title="Профиль" />
      <div className="px-4 space-y-4">
        {isAdmin && (
          <Link
            href="/admin"
            className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-amber-700/40 to-amber-900/40 border border-amber-600/40 p-4 active:scale-[0.99] transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-900/40 border border-amber-600/40 flex items-center justify-center">
                <Shield className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="text-white font-bold">Админ-панель</div>
                <div className="text-xs text-amber-200/70">
                  Управление турнирами и результатами
                </div>
              </div>
            </div>
            <span className="text-amber-300 text-lg">→</span>
          </Link>
        )}
        <div className="rounded-2xl bg-gradient-to-br from-burgundy-700 to-burgundy-800 border border-amber-900/30 p-5">
          <div className="flex items-center gap-4 mb-5">
            <UserAvatar name={user.nickname} size="xl" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="text-white font-bold text-xl truncate">
                  {user.nickname}
                </div>
                <ChangeNicknameDialog currentNickname={user.nickname} />
              </div>
              <div className="text-amber-200/60 text-sm">
                {TIER_LABELS[user.tier]}
                {user.ratingPosition > 0 && ` • #${user.ratingPosition} в рейтинге`}
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

        <RatingChart
          points={ratingHistory.points}
          delta={ratingHistory.delta}
          rangeLabel={ratingHistory.rangeLabel}
        />
        <AchievementsGrid achievements={achievements} />
        <ReferralCard
          user={{
            freeTickets: user.freeTickets,
            invitedCount: user.invitedCount,
            refereesGamesPlayed: user.refereesGamesPlayed,
            referralCode: user.referralCode,
          }}
        />
        <NotificationSettings
          initialNotifyTelegram={user.notifyTelegram}
          initialNotifyEmail={user.notifyEmail}
          hasTelegram={user.hasTelegram}
          hasEmail={Boolean(user.email)}
        />
        {!user.email && <BindEmailForm />}
      </div>
    </div>
  );
}

/**
 * Logged-out variant: just the email-bind form so an anonymous visitor can
 * still sign in from this screen. No /login page yet.
 */
export function ProfilePageAnonymous() {
  return (
    <div className="pb-28">
      <Header title="Профиль" />
      <div className="px-4 space-y-4">
        <div className="rounded-2xl bg-gradient-to-br from-amber-900/20 to-rose-900/20 border border-amber-700/30 p-5">
          <h2 className="text-white font-bold text-lg mb-2">Войдите в клуб</h2>
          <p className="text-amber-100/70 text-sm">
            Откройте приложение через Telegram или подтвердите email — после
            входа здесь будут ваш профиль, статистика и достижения.
          </p>
        </div>
        <BindEmailForm />
      </div>
    </div>
  );
}
