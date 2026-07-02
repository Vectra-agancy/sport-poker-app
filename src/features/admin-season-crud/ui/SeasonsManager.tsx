"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { Button, Input } from "@/shared/ui";
import {
  createSeason,
  deleteSeason,
  setActiveSeason,
  updateSeason,
  type SeasonFormValues,
} from "../api/actions";

export interface SeasonItem {
  id: number;
  name: string;
  slug: string;
  startDate: string; // yyyy-mm-dd
  endDate: string; // yyyy-mm-dd
  isActive: boolean;
  tournamentsCount: number;
}

const TRANSLIT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh",
  з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
  п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c",
  ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu",
  я: "ya",
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .split("")
    .map((ch) => TRANSLIT[ch] ?? ch)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function emptyValues(): SeasonFormValues {
  return { name: "", slug: "", startDate: "", endDate: "", isActive: false };
}

export function SeasonsManager({ seasons }: { seasons: SeasonItem[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [values, setValues] = useState<SeasonFormValues>(emptyValues());
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const openNew = () => {
    setError(null);
    setValues(emptyValues());
    setEditingId("new");
  };

  const openEdit = (s: SeasonItem) => {
    setError(null);
    setValues({
      name: s.name,
      slug: s.slug,
      startDate: s.startDate,
      endDate: s.endDate,
      isActive: s.isActive,
    });
    setEditingId(s.id);
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
      run(() => createSeason(values));
    } else if (typeof editingId === "number") {
      run(() => updateSeason(editingId, values));
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
          {editingId === "new" ? "Новый сезон" : "Редактирование"}
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
      <label className="block space-y-1">
        <span className="text-xs text-amber-200/70">Название</span>
        <Input
          value={values.name}
          onChange={(e) =>
            setValues((v) => ({
              ...v,
              name: e.target.value,
              // Пока slug не редактировали вручную, генерим его из названия
              slug:
                editingId === "new" && (!v.slug || v.slug === slugify(v.name))
                  ? slugify(e.target.value)
                  : v.slug,
            }))
          }
          placeholder="Осень 2026"
          required
        />
      </label>
      <label className="block space-y-1">
        <span className="text-xs text-amber-200/70">Slug (для ссылок)</span>
        <Input
          value={values.slug}
          onChange={(e) => setValues((v) => ({ ...v, slug: e.target.value }))}
          placeholder="autumn-2026"
          required
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block space-y-1">
          <span className="text-xs text-amber-200/70">Начало</span>
          <Input
            type="date"
            value={values.startDate}
            onChange={(e) =>
              setValues((v) => ({ ...v, startDate: e.target.value }))
            }
            required
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-amber-200/70">Окончание</span>
          <Input
            type="date"
            value={values.endDate}
            onChange={(e) =>
              setValues((v) => ({ ...v, endDate: e.target.value }))
            }
            required
          />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
        <input
          type="checkbox"
          checked={values.isActive}
          onChange={(e) =>
            setValues((v) => ({ ...v, isActive: e.target.checked }))
          }
        />
        Активный сезон (другие будут деактивированы)
      </label>
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
          Новый сезон
        </Button>
      )}

      {seasons.length === 0 && editingId !== "new" && (
        <div className="rounded-xl border border-amber-900/20 bg-burgundy-800/40 p-4 text-amber-200/60 text-sm">
          Сезонов ещё нет.
        </div>
      )}

      {seasons.map((s) =>
        editingId === s.id ? (
          <div key={s.id}>{form}</div>
        ) : (
          <div
            key={s.id}
            className="rounded-xl bg-burgundy-800/80 border border-amber-900/20 p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium truncate">
                    {s.name}
                  </span>
                  {s.isActive && (
                    <span className="text-[10px] uppercase px-1.5 py-0.5 rounded border border-emerald-500/40 bg-emerald-500/20 text-emerald-200 whitespace-nowrap">
                      активный
                    </span>
                  )}
                </div>
                <div className="text-xs text-amber-200/60 mt-0.5">
                  {s.slug} · {s.startDate} — {s.endDate} · турниров:{" "}
                  {s.tournamentsCount}
                </div>
              </div>
              <div className="flex items-center gap-3 whitespace-nowrap">
                {!s.isActive && (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(() => setActiveSeason(s.id))}
                    className="text-xs text-emerald-300 underline-offset-4 hover:underline disabled:opacity-40"
                  >
                    Сделать активным
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => openEdit(s)}
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
                        `Удалить сезон «${s.name}»? Турниры сезона останутся, но потеряют привязку к нему.`
                      )
                    ) {
                      run(() => deleteSeason(s.id));
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
