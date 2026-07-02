"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { Button, Input, NativeSelect } from "@/shared/ui";
import {
  createAchievement,
  deleteAchievement,
  updateAchievement,
  type AchievementFormValues,
} from "../api/actions";

export const ACHIEVEMENT_CATEGORY_OPTIONS = [
  { value: "participation", label: "Участие" },
  { value: "result", label: "Результат" },
  { value: "rare", label: "Редкое" },
];

export interface AchievementListItem {
  id: number;
  code: string;
  icon: string;
  title: string;
  description: string;
  category: string;
  isManual: boolean;
  unlockedCount: number;
}

function emptyValues(): AchievementFormValues {
  return {
    code: "",
    icon: "🏆",
    title: "",
    description: "",
    category: "participation",
    isManual: true,
  };
}

export function AchievementsManager({
  achievements,
}: {
  achievements: AchievementListItem[];
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [values, setValues] = useState<AchievementFormValues>(emptyValues());
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const openNew = () => {
    setError(null);
    setValues(emptyValues());
    setEditingId("new");
  };

  const openEdit = (a: AchievementListItem) => {
    setError(null);
    setValues({
      code: a.code,
      icon: a.icon,
      title: a.title,
      description: a.description,
      category: a.category,
      isManual: a.isManual,
    });
    setEditingId(a.id);
  };

  const close = () => {
    setEditingId(null);
    setError(null);
  };

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setError(null);
    startTransition(async () => {
      const result = await fn();
      if (!result.ok) {
        setError(result.error ?? "Что-то пошло не так");
        return;
      }
      close();
      router.refresh();
    });
  };

  const onSubmit = () => {
    if (editingId === "new") {
      run(() => createAchievement(values));
    } else if (typeof editingId === "number") {
      run(() => updateAchievement(editingId, values));
    }
  };

  const form = (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="rounded-2xl bg-burgundy-800/80 border border-amber-600/40 p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-white font-bold text-sm uppercase tracking-wider">
          {editingId === "new" ? "Новое достижение" : "Редактирование"}
        </h3>
        <button
          type="button"
          onClick={close}
          className="text-amber-200/60 hover:text-amber-200"
          aria-label="Закрыть"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-[80px_1fr] gap-3">
        <label className="block space-y-1">
          <span className="text-xs text-amber-200/70">Иконка</span>
          <Input
            value={values.icon}
            onChange={(e) =>
              setValues((v) => ({ ...v, icon: e.target.value }))
            }
            className="text-center"
            required
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-amber-200/70">Название</span>
          <Input
            value={values.title}
            onChange={(e) =>
              setValues((v) => ({ ...v, title: e.target.value }))
            }
            placeholder="Первая кровь"
            required
          />
        </label>
      </div>
      <label className="block space-y-1">
        <span className="text-xs text-amber-200/70">
          Код (уникальный, латиницей)
        </span>
        <Input
          value={values.code}
          onChange={(e) =>
            setValues((v) => ({
              ...v,
              code: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
            }))
          }
          placeholder="first_blood"
          required
        />
      </label>
      <label className="block space-y-1">
        <span className="text-xs text-amber-200/70">Описание</span>
        <textarea
          value={values.description}
          onChange={(e) =>
            setValues((v) => ({ ...v, description: e.target.value }))
          }
          rows={2}
          required
          className="w-full rounded-md border border-amber-900/30 bg-burgundy-900/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-600/40"
        />
      </label>
      <div className="grid grid-cols-2 gap-3 items-end">
        <label className="block space-y-1">
          <span className="text-xs text-amber-200/70">Категория</span>
          <NativeSelect
            value={values.category}
            onChange={(category) => setValues((v) => ({ ...v, category }))}
            options={ACHIEVEMENT_CATEGORY_OPTIONS}
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-white cursor-pointer pb-2">
          <input
            type="checkbox"
            checked={values.isManual}
            onChange={(e) =>
              setValues((v) => ({ ...v, isManual: e.target.checked }))
            }
          />
          Выдаётся вручную
        </label>
      </div>
      {error && (
        <div className="rounded-xl border border-rose-700/40 bg-rose-900/40 px-4 py-2 text-rose-100 text-sm">
          {error}
        </div>
      )}
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Сохранение…" : "Сохранить"}
        </Button>
        <Button type="button" variant="outline" onClick={close}>
          Отмена
        </Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-3">
      {editingId === "new" ? (
        form
      ) : (
        <Button type="button" variant="outline" size="sm" onClick={openNew}>
          <Plus className="w-4 h-4" />
          Новое достижение
        </Button>
      )}

      {achievements.length === 0 && editingId !== "new" && (
        <div className="rounded-xl border border-amber-900/20 bg-burgundy-800/40 p-4 text-amber-200/60 text-sm">
          Каталог пуст.
        </div>
      )}

      {achievements.map((a) =>
        editingId === a.id ? (
          <div key={a.id}>{form}</div>
        ) : (
          <div
            key={a.id}
            className="rounded-xl bg-burgundy-800/80 border border-amber-900/20 p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg leading-none">{a.icon}</span>
                  <span className="text-white font-medium truncate">
                    {a.title}
                  </span>
                  {a.isManual && (
                    <span className="text-[10px] uppercase px-1.5 py-0.5 rounded border border-amber-500/40 bg-amber-500/20 text-amber-200 whitespace-nowrap">
                      ручное
                    </span>
                  )}
                </div>
                <div className="text-xs text-amber-200/60 mt-1">
                  {a.description}
                </div>
                <div className="text-xs text-amber-200/40 mt-0.5">
                  {a.code} ·{" "}
                  {ACHIEVEMENT_CATEGORY_OPTIONS.find(
                    (c) => c.value === a.category
                  )?.label ?? a.category}{" "}
                  · получили: {a.unlockedCount}
                </div>
              </div>
              <div className="flex items-center gap-3 whitespace-nowrap">
                <button
                  type="button"
                  onClick={() => openEdit(a)}
                  className="text-amber-300 hover:text-amber-200"
                  aria-label="Редактировать"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    if (
                      confirm(
                        `Удалить достижение «${a.title}»? Оно пропадёт у всех ${a.unlockedCount} игроков, которые его получили.`
                      )
                    ) {
                      run(() => deleteAchievement(a.id));
                    }
                  }}
                  className="text-rose-300 hover:text-rose-200 disabled:opacity-40"
                  aria-label="Удалить"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )
      )}

      {error && editingId === null && (
        <div className="rounded-xl border border-rose-700/40 bg-rose-900/40 px-4 py-2 text-rose-100 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
