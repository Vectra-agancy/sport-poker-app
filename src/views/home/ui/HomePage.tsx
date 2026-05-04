import { Crown, TrendingUp, Trophy, Users } from "lucide-react";
import { Header } from "@/widgets/header";
import { TournamentList } from "@/widgets/tournament-list";
import { FriendsFeed } from "@/widgets/friends-feed";
import { RatingPodium } from "@/widgets/rating-podium";
import { MOCK_TOURNAMENTS } from "@/entities/tournament";
import { MOCK_FRIENDS_FEED, MOCK_RATING } from "@/entities/rating";

export function HomePage() {
  return (
    <div className="pb-28">
      <Header />
      <div className="px-4 space-y-6">
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 bg-amber-500 rounded-full" />
            <h2 className="text-white font-bold text-lg">Мои записи</h2>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-amber-900/20 to-rose-900/20 border border-amber-700/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-amber-200 font-bold">Ultra Bounty</div>
                <div className="text-xs text-amber-200/60 mt-0.5">
                  Вс, 03.05 в 17:00
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-medium">
                Записан
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-white font-bold text-lg">Ближайшие турниры</h2>
          </div>
          <TournamentList tournaments={MOCK_TOURNAMENTS.slice(0, 3)} />
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-amber-400" />
            <h2 className="text-white font-bold text-lg">Лента друзей</h2>
          </div>
          <FriendsFeed items={MOCK_FRIENDS_FEED} />
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-5 h-5 text-amber-400" />
            <h2 className="text-white font-bold text-lg">Топ рейтинга</h2>
          </div>
          <RatingPodium top3={MOCK_RATING.slice(0, 3)} variant="compact" />
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <h2 className="text-white font-bold text-lg">Клуб в цифрах</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-burgundy-700 to-burgundy-800 border border-amber-900/20 p-4">
              <div className="text-3xl font-bold text-white">2535</div>
              <div className="text-xs text-amber-200/60 uppercase tracking-wider mt-1">
                Игроков
              </div>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-burgundy-700 to-burgundy-800 border border-amber-900/20 p-4">
              <div className="text-3xl font-bold text-white">55</div>
              <div className="text-xs text-amber-200/60 uppercase tracking-wider mt-1">
                Турниров
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
