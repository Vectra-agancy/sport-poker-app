import { Award, Medal, Sparkles, Target } from "lucide-react";
import {
  AchievementBadge,
  type Achievement,
  type AchievementCategory,
} from "@/entities/achievement";

export interface AchievementsGridProps {
  achievements: Achievement[];
}

const CATEGORY_META: Record<
  AchievementCategory,
  { label: string; icon: typeof Sparkles }
> = {
  rare: { label: "Редкие события", icon: Sparkles },
  result: { label: "Результаты", icon: Target },
  participation: { label: "Турниры", icon: Medal },
};

const CATEGORY_ORDER: AchievementCategory[] = [
  "rare",
  "result",
  "participation",
];

export function AchievementsGrid({ achievements }: AchievementsGridProps) {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  return (
    <div className="rounded-2xl bg-burgundy-800/80 border border-amber-900/20 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          Достижения
        </h3>
        <span className="text-xs text-amber-300">
          {unlockedCount}/{achievements.length}
        </span>
      </div>

      {CATEGORY_ORDER.map((category) => {
        const items = achievements.filter((a) => a.category === category);
        if (items.length === 0) return null;
        const Icon = CATEGORY_META[category].icon;
        return (
          <div key={category} className="mb-4 last:mb-0">
            <div className="text-xs uppercase tracking-wider text-amber-200/40 mb-2 flex items-center gap-1">
              <Icon className="w-3 h-3" /> {CATEGORY_META[category].label}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {items.map((a) => (
                <AchievementBadge key={a.id} achievement={a} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
