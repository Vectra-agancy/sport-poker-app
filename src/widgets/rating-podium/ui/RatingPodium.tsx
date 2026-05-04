import { cn } from "@/shared/lib/utils";
import type { RatingRow } from "@/entities/rating";

export interface RatingPodiumProps {
  /** Rows in order: 1st, 2nd, 3rd. */
  top3: RatingRow[];
  /** "compact" — maps to home top-3 preview. "podium" — full podium. */
  variant?: "compact" | "podium";
}

export function RatingPodium({ top3, variant = "podium" }: RatingPodiumProps) {
  if (variant === "compact") {
    // Display: 2nd | 1st | 3rd ordered visually
    const order = [1, 0, 2];
    const medals = ["🥇", "🥈", "🥉"];
    const heights = ["pt-2", "pt-6", "pt-8"];
    return (
      <div className="grid grid-cols-3 gap-2">
        {order.map((idx, i) => {
          const player = top3[idx];
          if (!player) return <div key={i} />;
          return (
            <div
              key={i}
              className={cn(
                "rounded-xl bg-gradient-to-b from-amber-900/30 to-burgundy-800 border border-amber-700/30 p-3 text-center",
                heights[i]
              )}
            >
              <div className="text-2xl mb-1">{medals[idx]}</div>
              <div className="text-white font-bold text-sm truncate">
                {player.name}
              </div>
              <div className="text-amber-300 text-xs font-medium mt-1">
                {player.points.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  // Full podium with bars
  const order = [1, 0, 2];
  const medals = ["🥈", "🥇", "🥉"];
  const heights = ["h-24", "h-32", "h-20"];
  const colors = [
    "from-slate-400/30 to-slate-600/20 border-slate-400/30",
    "from-amber-400/40 to-amber-600/20 border-amber-400/40",
    "from-orange-700/30 to-orange-900/20 border-orange-700/30",
  ];
  return (
    <div className="rounded-2xl bg-gradient-to-b from-amber-900/20 to-transparent border border-amber-700/20 p-4">
      <div className="grid grid-cols-3 gap-2 items-end">
        {order.map((idx, i) => {
          const p = top3[idx];
          if (!p) return <div key={i} />;
          return (
            <div key={i} className="text-center">
              <div className="text-3xl mb-1">{medals[i]}</div>
              <div className="text-white font-bold truncate text-sm">
                {p.name}
              </div>
              <div className="text-amber-300 text-xs">
                {p.points.toLocaleString()}
              </div>
              <div
                className={cn(
                  "mt-2 rounded-t-xl bg-gradient-to-t border flex items-start justify-center pt-2",
                  heights[i],
                  colors[i]
                )}
              >
                <span className="text-2xl font-bold text-white">
                  {i === 1 ? 1 : i === 0 ? 2 : 3}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
