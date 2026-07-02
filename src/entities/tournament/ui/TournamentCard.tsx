import { Coins, Trophy, Users } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Progress } from "@/shared/ui";
import type { Tournament } from "../model/types";
import { TournamentTypeBadge } from "./TournamentTypeBadge";

export interface TournamentCardProps {
  tournament: Tournament;
}

/**
 * Pure presentational card. Wrap with `<Link>` in a widget if you need navigation.
 */
export function TournamentCard({ tournament }: TournamentCardProps) {
  const t = tournament;
  const pct = Math.round((t.seats / t.maxSeats) * 100);
  const seatsLeft = Math.max(0, t.maxSeats - t.seats);
  const isFinished = t.status === "finished";
  const isCancelled = t.status === "cancelled";
  const isLive = t.status === "in_progress";
  const isPast = isFinished || isCancelled;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-gradient-to-br from-burgundy-700 to-burgundy-800 border p-4 press shadow-lg",
        isPast
          ? "border-amber-900/10 opacity-70"
          : "border-amber-900/20 hover:border-amber-600/40"
      )}
    >
      {/* Тонкая золотая кромка сверху проявляется на hover/focus */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold text-lg mb-1 truncate">
            {t.name}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <TournamentTypeBadge type={t.type} />
            {isLive && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                Идёт
              </span>
            )}
            {isFinished && (
              <span className="px-2 py-0.5 rounded-md text-xs font-medium border bg-slate-500/20 text-slate-300 border-slate-500/40">
                Завершён
              </span>
            )}
            {isCancelled && (
              <span className="px-2 py-0.5 rounded-md text-xs font-medium border bg-rose-500/20 text-rose-300 border-rose-500/40">
                Отменён
              </span>
            )}
            {t.season && (
              <span className="text-xs text-amber-200/60">{t.season}</span>
            )}
          </div>
        </div>
        <div className="text-right shrink-0 ml-3">
          <div className="text-amber-200 font-bold text-lg">{t.time}</div>
          <div className="text-xs text-amber-200/50">{t.date}</div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-2.5 text-sm flex-wrap">
        <div
          className={cn(
            "flex items-center gap-1.5",
            !isPast && seatsLeft === 0 ? "text-rose-300" : "text-amber-100/80"
          )}
        >
          <Users className="w-4 h-4" />
          <span className="font-medium">
            {t.seats}/{t.maxSeats}
          </span>
          {!isPast && seatsLeft > 0 && seatsLeft <= 5 && (
            <span className="text-xs text-rose-300/90">
              осталось {seatsLeft}
            </span>
          )}
          {!isPast && seatsLeft === 0 && (
            <span className="text-xs">лист ожидания</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-amber-100/80">
          <Coins className="w-4 h-4 text-amber-400/80" />
          <span className="font-medium">{t.ticket.toLocaleString()}₽</span>
        </div>
        {t.guarantee ? (
          <div className="flex items-center gap-1.5 text-amber-300">
            <Trophy className="w-4 h-4" />
            <span className="font-medium">
              {t.guarantee.toLocaleString()}₽
            </span>
          </div>
        ) : null}
      </div>

      <Progress value={pct} />
    </div>
  );
}
