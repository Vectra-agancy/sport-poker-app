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
      title={`${achievement.title} — ${achievement.desc}`}
      className={cn(
        "rounded-xl border p-2 text-center transition-all duration-200",
        achievement.unlocked
          ? isRare
            ? "bg-gradient-to-br from-amber-900/40 to-amber-950/40 border-amber-600/40 shadow-[0_0_12px_rgba(251,191,36,0.12)] hover:shadow-[0_0_16px_rgba(251,191,36,0.25)] hover:-translate-y-0.5"
            : "bg-burgundy-900/60 border-amber-900/20 hover:border-amber-700/40 hover:-translate-y-0.5"
          : "bg-burgundy-900/40 border-amber-900/10 opacity-40 grayscale",
        className
      )}
    >
      <div
        className={cn(
          "text-2xl mb-1",
          achievement.unlocked && isRare && "animate-float"
        )}
      >
        {achievement.icon}
      </div>
      <div className="text-white text-[10px] font-medium leading-tight">
        {achievement.title}
      </div>
    </div>
  );
}
