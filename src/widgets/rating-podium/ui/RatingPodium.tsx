import { Crown } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { UserAvatar } from "@/entities/user";
import type { RatingRow } from "@/entities/rating";

export interface RatingPodiumProps {
  /** Rows in order: 1st, 2nd, 3rd. */
  top3: RatingRow[];
  /** "compact" — maps to home top-3 preview. "podium" — full podium. */
  variant?: "compact" | "podium";
}

/** Per-place visual config keyed by the row index (0 = 1st place). */
const PLACE = [
  {
    label: "1",
    medal: "🥇",
    ring: "ring-amber-400/80",
    badge: "from-amber-300 to-amber-500 text-amber-950",
    bar: "from-amber-400/40 to-amber-600/10 border-amber-400/40",
    barH: "h-24",
    avatar: "lg" as const,
  },
  {
    label: "2",
    medal: "🥈",
    ring: "ring-slate-300/70",
    badge: "from-slate-200 to-slate-400 text-slate-800",
    bar: "from-slate-400/30 to-slate-600/10 border-slate-400/30",
    barH: "h-16",
    avatar: "md" as const,
  },
  {
    label: "3",
    medal: "🥉",
    ring: "ring-orange-500/70",
    badge: "from-orange-400 to-orange-600 text-orange-950",
    bar: "from-orange-600/30 to-orange-900/10 border-orange-600/30",
    barH: "h-12",
    avatar: "md" as const,
  },
] as const;

function PodiumColumn({
  player,
  place,
  delay,
}: {
  player: RatingRow;
  place: (typeof PLACE)[number];
  delay: number;
}) {
  const isFirst = place.label === "1";
  return (
    <div
      className="flex flex-col items-center justify-end animate-rise-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {isFirst && (
        <Crown className="w-6 h-6 text-amber-300 mb-1 animate-float drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
      )}
      <div className="relative">
        <UserAvatar
          name={player.name}
          size={place.avatar}
          className={cn("ring-2 ring-offset-2 ring-offset-burgundy-900", place.ring)}
        />
        <span
          className={cn(
            "absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br text-[10px] font-black shadow-md",
            place.badge
          )}
        >
          {place.label}
        </span>
      </div>
      <div className="mt-2 w-full truncate text-center text-sm font-bold text-white">
        {player.name}
      </div>
      <div className="text-xs font-semibold text-amber-300">
        {player.points.toLocaleString()}
      </div>
      <div
        className={cn(
          "mt-2 flex w-full items-center justify-center rounded-t-xl border border-b-0 bg-gradient-to-t",
          place.bar,
          place.barH
        )}
      >
        <span className="text-xl font-black text-white/80">{place.medal}</span>
      </div>
    </div>
  );
}

export function RatingPodium({ top3, variant = "podium" }: RatingPodiumProps) {
  // Visual order on screen: 2nd | 1st | 3rd
  const layout = [
    { row: top3[1], place: PLACE[1], delay: 60 },
    { row: top3[0], place: PLACE[0], delay: 0 },
    { row: top3[2], place: PLACE[2], delay: 120 },
  ];

  if (variant === "compact") {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-amber-700/30 bg-gradient-to-b from-amber-950/40 via-burgundy-900 to-burgundy-900 p-4">
        <div className="pointer-events-none absolute -top-12 left-1/2 h-32 w-40 -translate-x-1/2 rounded-full bg-amber-500/20 blur-3xl animate-glow-pulse" />
        <div className="relative grid grid-cols-3 items-end gap-3">
          {layout.map((c, i) =>
            c.row ? (
              <PodiumColumn
                key={i}
                player={c.row}
                place={c.place}
                delay={c.delay}
              />
            ) : (
              <div key={i} />
            )
          )}
        </div>
      </div>
    );
  }

  // Full podium — same structure, a touch more presence.
  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-700/30 bg-gradient-to-b from-amber-950/50 via-burgundy-900 to-burgundy-900 p-5">
      <div className="pointer-events-none absolute -top-16 left-1/2 h-40 w-52 -translate-x-1/2 rounded-full bg-amber-500/25 blur-3xl animate-glow-pulse" />
      {/* Shimmer sweep across the card */}
      <div className="pointer-events-none absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      <div className="relative grid grid-cols-3 items-end gap-3">
        {layout.map((c, i) =>
          c.row ? (
            <PodiumColumn
              key={i}
              player={c.row}
              place={c.place}
              delay={c.delay}
            />
          ) : (
            <div key={i} />
          )
        )}
      </div>
    </div>
  );
}
