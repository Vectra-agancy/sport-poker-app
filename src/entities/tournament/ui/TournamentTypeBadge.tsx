import { cn } from "@/shared/lib/utils";
import { TOURNAMENT_TYPES } from "../model/constants";
import type { TournamentType } from "../model/types";

export interface TournamentTypeBadgeProps {
  type: TournamentType;
  className?: string;
}

export function TournamentTypeBadge({
  type,
  className,
}: TournamentTypeBadgeProps) {
  const meta = TOURNAMENT_TYPES[type];
  return (
    <span
      className={cn(
        "px-2 py-0.5 rounded-md text-xs font-medium border",
        meta.className,
        className
      )}
    >
      {meta.label}
    </span>
  );
}
