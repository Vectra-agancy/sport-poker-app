import { Users } from "lucide-react";
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
  return (
    <div className="rounded-2xl bg-gradient-to-br from-burgundy-700 to-burgundy-800 border border-amber-900/20 p-4 active:scale-[0.98] transition shadow-lg">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold text-lg mb-1 truncate">{t.name}</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <TournamentTypeBadge type={t.type} />
            {t.season && (
              <span className="text-xs text-amber-200/60">{t.season}</span>
            )}
          </div>
        </div>
        <div className="text-right shrink-0 ml-3">
          <div className="text-amber-200 font-bold text-lg">{t.time}</div>
          <div className="text-xs text-amber-200/50">{t.day}</div>
        </div>
      </div>
      <div className="flex items-center gap-4 mb-2 text-sm">
        <div className="flex items-center gap-1.5 text-amber-100/80">
          <Users className="w-4 h-4" />
          <span className="font-medium">
            {t.seats}/{t.maxSeats}
          </span>
        </div>
        <div className="text-amber-100/50 text-xs">{t.date}</div>
      </div>
      <Progress value={pct} />
    </div>
  );
}
