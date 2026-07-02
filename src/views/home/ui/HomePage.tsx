import Link from "next/link";
import { Crown, TrendingUp, Trophy, Users } from "lucide-react";
import { Header } from "@/widgets/header";
import { TournamentList } from "@/widgets/tournament-list";
import { FriendsFeed } from "@/widgets/friends-feed";
import { RatingPodium } from "@/widgets/rating-podium";
import type { Tournament } from "@/entities/tournament";
import type { FriendFeedItem, RatingRow } from "@/entities/rating";
import type { MyRegistrationSummary } from "@/entities/tournament";

const DAY_SHORT: Record<number, string> = {
  0: "Вс",
  1: "Пн",
  2: "Вт",
  3: "Ср",
  4: "Чт",
  5: "Пт",
  6: "Сб",
};

// Клуб живёт по Санкт-Петербургу (UTC+3)
const CLUB_UTC_OFFSET_HOURS = 3;

function greetingByHour(): string {
  const hour =
    (new Date().getUTCHours() + CLUB_UTC_OFFSET_HOURS + 24) % 24;
  if (hour >= 5 && hour < 12) return "Доброе утро";
  if (hour >= 12 && hour < 18) return "Добрый день";
  if (hour >= 18 && hour < 23) return "Добрый вечер";
  return "Доброй ночи";
}

function formatRegistrationLine(reg: MyRegistrationSummary): string {
  const d = reg.startsAt;
  return `${DAY_SHORT[d.getUTCDay()]}, ${String(d.getUTCDate()).padStart(2, "0")}.${String(
    d.getUTCMonth() + 1
  ).padStart(2, "0")} в ${String(d.getUTCHours()).padStart(2, "0")}:${String(
    d.getUTCMinutes()
  ).padStart(2, "0")}`;
}

export interface HomePageProps {
  nickname: string | null;
  upcomingTournaments: Tournament[];
  myRegistrations: MyRegistrationSummary[];
  topRating: RatingRow[];
  friendsFeed: FriendFeedItem[];
  clubStats: { players: number; tournaments: number };
}

export function HomePage({
  nickname,
  upcomingTournaments,
  myRegistrations,
  topRating,
  friendsFeed,
  clubStats,
}: HomePageProps) {
  return (
    <div className="pb-28">
      <Header />
      <div className="px-4 space-y-6">
        <section className="animate-rise-up">
          <h1 className="text-2xl font-bold text-white">
            {greetingByHour()}
            {nickname ? (
              <>
                ,{" "}
                <span className="bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
                  {nickname}
                </span>
              </>
            ) : null}
            !
          </h1>
          <p className="text-sm text-amber-200/60 mt-1">
            {nickname
              ? "За столами уже тасуют — посмотрим, что сегодня в клубе."
              : "Добро пожаловать в спортивный покерный клуб RERAISE."}
          </p>
        </section>

        {myRegistrations.length > 0 && (
          <section className="animate-rise-up" style={{ animationDelay: "40ms" }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-5 bg-amber-500 rounded-full" />
              <h2 className="text-white font-bold text-lg">Мои записи</h2>
            </div>
            <div className="space-y-2">
              {myRegistrations.map((r) => {
                const waitlist = r.status === "waitlist";
                return (
                  <Link
                    key={r.tournamentId}
                    href={`/tournament/${r.tournamentId}`}
                    className="block rounded-2xl bg-gradient-to-br from-amber-900/20 to-rose-900/20 border border-amber-700/30 p-4 press hover:border-amber-500/40"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-amber-200 font-bold truncate">
                          {r.name}
                        </div>
                        <div className="text-xs text-amber-200/60 mt-0.5">
                          {formatRegistrationLine(r)}
                        </div>
                      </div>
                      <div
                        className={
                          waitlist
                            ? "px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-medium whitespace-nowrap"
                            : "px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-medium whitespace-nowrap"
                        }
                      >
                        {waitlist ? "Лист ожидания" : "Записан"}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <section className="animate-rise-up" style={{ animationDelay: "80ms" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h2 className="text-white font-bold text-lg">
                Ближайшие турниры
              </h2>
            </div>
            <Link
              href="/calendar"
              className="text-sm text-amber-300/90 hover:text-amber-200 transition"
            >
              Все →
            </Link>
          </div>
          {upcomingTournaments.length > 0 ? (
            <TournamentList tournaments={upcomingTournaments} />
          ) : (
            <EmptyState text="Пока турниров не запланировано" />
          )}
        </section>

        <section className="animate-rise-up" style={{ animationDelay: "140ms" }}>
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-amber-400" />
            <h2 className="text-white font-bold text-lg">Лента друзей</h2>
          </div>
          {friendsFeed.length > 0 ? (
            <FriendsFeed items={friendsFeed} />
          ) : (
            <Link
              href="/rating"
              className="block rounded-2xl bg-burgundy-800/60 border border-amber-900/20 p-6 text-center text-amber-200/60 text-sm press hover:border-amber-600/40"
            >
              Подпишитесь на игроков в рейтинге, чтобы видеть их активность →
            </Link>
          )}
        </section>

        {topRating.length >= 3 && (
          <section className="animate-rise-up" style={{ animationDelay: "200ms" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <h2 className="text-white font-bold text-lg">Топ рейтинга</h2>
              </div>
              <Link
                href="/rating"
                className="text-sm text-amber-300/90 hover:text-amber-200 transition"
              >
                Весь рейтинг →
              </Link>
            </div>
            <Link href="/rating" className="block press">
              <RatingPodium top3={topRating.slice(0, 3)} variant="compact" />
            </Link>
          </section>
        )}

        <section className="animate-rise-up" style={{ animationDelay: "260ms" }}>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <h2 className="text-white font-bold text-lg">Клуб в цифрах</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Игроков" value={clubStats.players} />
            <StatCard label="Турниров" value={clubStats.tournaments} />
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-burgundy-700 to-burgundy-800 border border-amber-900/20 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-600/40 hover:shadow-lg hover:shadow-amber-950/40">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="text-3xl font-bold text-white tabular-nums">{value}</div>
      <div className="text-xs text-amber-200/60 uppercase tracking-wider mt-1">
        {label}
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl bg-burgundy-800/60 border border-amber-900/20 p-6 text-center text-amber-200/50 text-sm">
      {text}
    </div>
  );
}
