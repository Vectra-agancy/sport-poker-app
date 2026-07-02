"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { grantAchievement, revokeAchievement } from "../api/actions";

export interface AchievementToggleItem {
  id: number;
  icon: string;
  title: string;
  isManual: boolean;
  unlocked: boolean;
}

export function PlayerAchievements({
  playerId,
  achievements,
}: {
  playerId: number;
  achievements: AchievementToggleItem[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const toggle = (a: AchievementToggleItem) => {
    setError(null);
    startTransition(async () => {
      const result = a.unlocked
        ? await revokeAchievement(playerId, a.id)
        : await grantAchievement(playerId, a.id);
      if (!result.ok) {
        setError(result.error ?? "Что-то пошло не так");
        return;
      }
      router.refresh();
    });
  };

  return (
    <section className="rounded-2xl bg-burgundy-800/80 border border-amber-900/20 p-4 space-y-3">
      <h3 className="text-white font-bold text-sm uppercase tracking-wider">
        Достижения
      </h3>
      <p className="text-xs text-amber-200/50">
        Нажмите, чтобы выдать или отозвать. Автоматические достижения могут
        вернуться при следующем пересчёте результатов.
      </p>
      <div className="flex flex-wrap gap-2">
        {achievements.map((a) => (
          <button
            key={a.id}
            type="button"
            disabled={pending}
            onClick={() => toggle(a)}
            title={a.unlocked ? "Отозвать" : "Выдать"}
            className={`rounded-lg border px-3 py-1.5 text-sm transition disabled:opacity-50 ${
              a.unlocked
                ? "bg-amber-500/20 border-amber-500/40 text-amber-200"
                : "border-amber-900/20 text-amber-100/50 hover:text-amber-200 hover:border-amber-600/40"
            }`}
          >
            {a.icon} {a.title}
            {a.isManual && (
              <span className="ml-1 text-[10px] uppercase text-amber-200/50">
                ручное
              </span>
            )}
          </button>
        ))}
        {achievements.length === 0 && (
          <span className="text-sm text-amber-200/60">
            Каталог достижений пуст.
          </span>
        )}
      </div>
      {error && (
        <div className="rounded-xl border border-rose-700/40 bg-rose-900/40 px-4 py-2 text-rose-100 text-sm">
          {error}
        </div>
      )}
    </section>
  );
}
