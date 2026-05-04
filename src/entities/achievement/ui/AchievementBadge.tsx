import { cn } from "@/shared/lib/utils";
import type { Achievement } from "../model/types";

export interface AchievementBadgeProps {
  achievement: Achievement;
  className?: string;
}

export function AchievementBadge({
  achievement,
  className,
}: AchievementBadgeProps) {
  const isRare = achievement.category === "rare";
  return (
    <div
      className={cn(
        "rounded-xl border p-2 text-center transition",
        achievement.unlocked
          ? isRare
            ? "bg-gradient-to-br from-amber-900/40 to-amber-950/40 border-amber-600/40"
            : "bg-burgundy-900/60 border-amber-900/20"
          : "bg-burgundy-900/40 border-amber-900/10 opacity-40",
        className
      )}
    >
      <div className="text-2xl mb-1">{achievement.icon}</div>
      <div className="text-white text-[10px] font-medium leading-tight">
        {achievement.title}
      </div>
    </div>
  );
}
