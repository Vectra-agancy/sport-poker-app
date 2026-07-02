import { cn } from "@/shared/lib/utils";
import { TIER_LABELS } from "../model/labels";
import type { Tier } from "../model/types";

const TIER_CLASSES: Record<Tier, string> = {
  bronze: "bg-orange-500/15 text-orange-300 border-orange-500/40",
  silver: "bg-slate-400/15 text-slate-200 border-slate-400/40",
  gold: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  platinum: "bg-cyan-400/15 text-cyan-200 border-cyan-400/40",
};

export interface TierBadgeProps {
  tier: Tier;
  className?: string;
}

export function TierBadge({ tier, className }: TierBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border whitespace-nowrap",
        TIER_CLASSES[tier] ?? TIER_CLASSES.bronze,
        className
      )}
    >
      {TIER_LABELS[tier] ?? tier}
    </span>
  );
}
