import Link from "next/link";
import { cn } from "@/shared/lib/utils";
import type { RatingRow } from "@/entities/rating";
import { UserAvatar } from "@/entities/user";

export interface RatingTableProps {
  rows: RatingRow[];
}

export function RatingTable({ rows }: RatingTableProps) {
  return (
    <div className="rounded-2xl bg-burgundy-800/80 border border-amber-900/20 overflow-hidden">
      <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-amber-900/20 text-xs uppercase tracking-wider text-amber-200/60">
        <div className="col-span-1">#</div>
        <div className="col-span-5">Никнейм</div>
        <div className="col-span-3 text-right">Баунти</div>
        <div className="col-span-3 text-right">Очки</div>
      </div>
      {rows.map((p, i) => (
        <Link
          key={p.pos}
          href={`/u/${encodeURIComponent(p.name)}`}
          style={{ animationDelay: `${Math.min(i, 12) * 35}ms` }}
          className="grid grid-cols-12 gap-2 px-4 py-3 items-center border-b border-amber-900/10 last:border-b-0 hover:bg-amber-900/10 active:bg-amber-900/15 transition-colors animate-rise-up"
        >
          <div
            className={cn(
              "col-span-1 font-bold tabular-nums",
              p.pos === 1 && "text-amber-300",
              p.pos === 2 && "text-slate-300",
              p.pos === 3 && "text-orange-400",
              p.pos > 3 && "text-amber-200/60"
            )}
          >
            {p.pos}
          </div>
          <div className="col-span-5 flex items-center gap-2 min-w-0">
            <UserAvatar name={p.name} size="sm" />
            <span className="text-white font-medium truncate">{p.name}</span>
            {p.change > 0 && (
              <span className="text-emerald-400 text-xs">▲{p.change}</span>
            )}
            {p.change < 0 && (
              <span className="text-rose-400 text-xs">▼{Math.abs(p.change)}</span>
            )}
          </div>
          <div className="col-span-3 text-right text-amber-100 font-medium">
            {p.bounties}
          </div>
          <div className="col-span-3 text-right text-amber-300 font-bold">
            {p.points.toLocaleString()}
          </div>
        </Link>
      ))}
    </div>
  );
}
