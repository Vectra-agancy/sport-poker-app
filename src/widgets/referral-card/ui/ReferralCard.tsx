import { Gift, Share2 } from "lucide-react";
import type { CurrentUser } from "@/entities/user";

export interface ReferralCardProps {
  user: Pick<
    CurrentUser,
    "freeTickets" | "invitedCount" | "refereesGamesPlayed"
  >;
  onShare?: () => void;
}

const GAMES_PER_TICKET = 10;

export function ReferralCard({ user, onShare }: ReferralCardProps) {
  const inProgress = user.refereesGamesPlayed % GAMES_PER_TICKET;
  const pct = Math.round((inProgress / GAMES_PER_TICKET) * 100);

  return (
    <div className="rounded-2xl bg-gradient-to-br from-amber-900/30 to-rose-900/20 border border-amber-700/30 p-5">
      <h3 className="text-white font-bold flex items-center gap-2 mb-3">
        <Gift className="w-5 h-5 text-amber-400" />
        Пригласить друзей
      </h3>
      <p className="text-amber-100/70 text-sm mb-4">
        За каждые {GAMES_PER_TICKET} сыгранных турниров вашего реферала —
        бесплатный билет
      </p>
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="rounded-xl bg-burgundy-900/50 p-3 text-center">
          <div className="text-white font-bold text-xl">{user.invitedCount}</div>
          <div className="text-[10px] text-amber-200/50 uppercase tracking-wider mt-0.5">
            Приглашено
          </div>
        </div>
        <div className="rounded-xl bg-burgundy-900/50 p-3 text-center">
          <div className="text-white font-bold text-xl">
            {user.refereesGamesPlayed}
          </div>
          <div className="text-[10px] text-amber-200/50 uppercase tracking-wider mt-0.5">
            Игр сыграно
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-amber-600/40 to-amber-800/40 border border-amber-500/40 p-3 text-center">
          <div className="text-white font-bold text-xl">{user.freeTickets}</div>
          <div className="text-[10px] text-amber-100 uppercase tracking-wider mt-0.5">
            Бесп. билета
          </div>
        </div>
      </div>
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-amber-200/60">До следующего билета</span>
          <span className="text-amber-300 font-medium">
            {inProgress} / {GAMES_PER_TICKET} игр
          </span>
        </div>
        <div className="h-2 rounded-full bg-burgundy-900/50 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <button
        type="button"
        onClick={onShare}
        className="w-full py-3 rounded-xl bg-amber-500 text-black font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition"
      >
        <Share2 className="w-4 h-4" />
        Поделиться ссылкой
      </button>
    </div>
  );
}
