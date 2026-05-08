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

function formatRegistrationLine(reg: MyRegistrationSummary): string {
  const d = reg.startsAt;
  return `${DAY_SHORT[d.getUTCDay()]}, ${String(d.getUTCDate()).padStart(2, "0")}.${String(
    d.getUTCMonth() + 1
  ).padStart(2, "0")} в ${String(d.getUTCHours()).padStart(2, "0")}:${String(
    d.getUTCMinutes()
  ).padStart(2, "0")}`;
}

export interface HomePageProps {
  upcomingTournaments: Tournament[];
  myRegistrations: MyRegistrationSummary[];
  topRating: RatingRow[];
  friendsFeed: FriendFeedItem[];
  clubStats: { players: number; tournaments: number };
}

export function HomePage({
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
        {myRegistrations.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-5 bg-amber-500 rounded-full" />
              <h2 className="text-white font-bold text-lg">Мои записи</h2>
            </div>
            <div className="space-y-2">
              {myRegistrations.map((r) => (
                <div
                  key={r.tournamentId}
                  className="rounded-2xl bg-gradient-to-br from-amber-900/20 to-rose-900/20 border border-amber-700/30 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-amber-200 font-bold">{r.name}</div>
                      <div className="text-xs text-amber-200/60 mt-0.5">
                        {formatRegistrationLine(r)}
                      </div>
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-medium">
                      Записан
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-white font-bold text-lg">Ближайшие турниры</h2>
          </div>
          {upcomingTournaments.length > 0 ? (
            <TournamentList tournaments={upcomingTournaments} />
          ) : (
            <EmptyState text="Пока турниров не запланировано" />
          )}
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-amber-400" />
            <h2 className="text-white font-bold text-lg">Лента друзей</h2>
          </div>
          {friendsFeed.length > 0 ? (
            <FriendsFeed items={friendsFeed} />
          ) : (
            <Link
              href="/rating"
              className="block rounded-2xl bg-burgundy-800/60 border border-amber-900/20 p-6 text-center text-amber-200/60 text-sm hover:border-amber-600/40 transition"
            >
              Подпишитесь на игроков в рейтинге, чтобы видеть их активность →
            </Link>
          )}
        </section>

        {topRating.length >= 3 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Crown className="w-5 h-5 text-amber-400" />
              <h2 className="text-white font-bold text-lg">Топ рейтинга</h2>
            </div>
            <RatingPodium top3={topRating.slice(0, 3)} variant="compact" />
          </section>
        )}

        <section>
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
    <div className="rounded-2xl bg-gradient-to-br from-burgundy-700 to-burgundy-800 border border-amber-900/20 p-4">
      <div className="text-3xl font-bold text-white">{value}</div>
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
