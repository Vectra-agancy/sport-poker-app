"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button, Input } from "@/shared/ui";
import { TOURNAMENT_TYPES, type TournamentType } from "@/entities/tournament";
import {
  createTournament,
  deleteTournament,
  updateTournament,
} from "../api/actions";
import type {
  TournamentFormValues,
  TournamentLevelInput,
} from "../model/types";

export interface SeasonOption {
  id: number;
  name: string;
}

const STATUS_OPTIONS = [
  { value: "scheduled", label: "Запланирован" },
  { value: "in_progress", label: "В процессе" },
  { value: "finished", label: "Завершён" },
  { value: "cancelled", label: "Отменён" },
];

const DEFAULT_LEVEL: Omit<TournamentLevelInput, "level"> = {
  smallBlind: 100,
  bigBlind: 200,
  ante: 0,
  durationMin: 20,
  isBreak: false,
};

export interface TournamentFormProps {
  seasons: SeasonOption[];
  tournamentId?: number;
  initial?: TournamentFormValues;
  initialStatus?: string;
}

function emptyValues(): TournamentFormValues {
  return {
    name: "",
    type: "bounty",
    startsAt: "",
    location: "Кожевенная линия, 30, Лофт Brosko",
    maxSeats: 60,
    startStack: 30000,
    ticketPrice: 1000,
    guarantee: null,
    format: null,
    seasonId: null,
    levels: [{ level: 1, ...DEFAULT_LEVEL }],
  };
}

export function TournamentForm({
  seasons,
  tournamentId,
  initial,
  initialStatus,
}: TournamentFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<TournamentFormValues>(
    initial ?? emptyValues()
  );
  const [status, setStatus] = useState<string>(initialStatus ?? "scheduled");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [deleting, startDelete] = useTransition();

  const update = (patch: Partial<TournamentFormValues>) => {
    setValues((v) => ({ ...v, ...patch }));
  };

  const updateLevel = (idx: number, patch: Partial<TournamentLevelInput>) => {
    setValues((v) => ({
      ...v,
      levels: v.levels.map((l, i) => (i === idx ? { ...l, ...patch } : l)),
    }));
  };

  const addLevel = () => {
    setValues((v) => ({
      ...v,
      levels: [
        ...v.levels,
        { level: v.levels.length + 1, ...DEFAULT_LEVEL },
      ],
    }));
  };

  const removeLevel = (idx: number) => {
    setValues((v) => ({
      ...v,
      levels: v.levels
        .filter((_, i) => i !== idx)
        .map((l, i) => ({ ...l, level: i + 1 })),
    }));
  };

  const onSubmit = () => {
    setError(null);
    startTransition(async () => {
      const result = tournamentId
        ? await updateTournament(tournamentId, values, status)
        : await createTournament(values);
      if (!result.ok) {
        setError(result.error ?? "Что-то пошло не так");
        return;
      }
      router.push("/admin/tournaments");
      router.refresh();
    });
  };

  const onDelete = () => {
    if (!tournamentId) return;
    if (!confirm("Удалить турнир и все его регистрации?")) return;
    setError(null);
    startDelete(async () => {
      const result = await deleteTournament(tournamentId);
      if (!result.ok) {
        setError(result.error ?? "Не удалось удалить");
        return;
      }
      router.push("/admin/tournaments");
      router.refresh();
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-4"
    >
      <Section title="Основные данные">
        <Field label="Название">
          <Input
            value={values.name}
            onChange={(e) => update({ name: e.target.value })}
            required
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Тип">
            <NativeSelect
              value={values.type}
              onChange={(v) => update({ type: v as TournamentType })}
              options={Object.entries(TOURNAMENT_TYPES).map(([k, m]) => ({
                value: k,
                label: m.label,
              }))}
            />
          </Field>
          <Field label="Сезон">
            <NativeSelect
              value={values.seasonId?.toString() ?? ""}
              onChange={(v) =>
                update({ seasonId: v ? Number(v) : null })
              }
              options={[
                { value: "", label: "Без сезона" },
                ...seasons.map((s) => ({
                  value: s.id.toString(),
                  label: s.name,
                })),
              ]}
            />
          </Field>
        </div>
        <Field label="Дата и время начала">
          <Input
            type="datetime-local"
            value={values.startsAt}
            onChange={(e) => update({ startsAt: e.target.value })}
            required
          />
        </Field>
        <Field label="Место">
          <Input
            value={values.location}
            onChange={(e) => update({ location: e.target.value })}
            required
          />
        </Field>
      </Section>

      <Section title="Параметры">
        <div className="grid grid-cols-3 gap-3">
          <Field label="Мест">
            <Input
              type="number"
              min={1}
              value={values.maxSeats}
              onChange={(e) =>
                update({ maxSeats: Number(e.target.value) })
              }
            />
          </Field>
          <Field label="Стек">
            <Input
              type="number"
              min={1}
              value={values.startStack}
              onChange={(e) =>
                update({ startStack: Number(e.target.value) })
              }
            />
          </Field>
          <Field label="Билет, ₽">
            <Input
              type="number"
              min={0}
              value={values.ticketPrice}
              onChange={(e) =>
                update({ ticketPrice: Number(e.target.value) })
              }
            />
          </Field>
        </div>
        <Field label="Гарантия (необязательно)">
          <Input
            type="number"
            min={0}
            value={values.guarantee ?? ""}
            onChange={(e) =>
              update({
                guarantee:
                  e.target.value === "" ? null : Number(e.target.value),
              })
            }
            placeholder="Например, 90000"
          />
        </Field>
        <Field label="Описание формата (необязательно)">
          <textarea
            value={values.format ?? ""}
            onChange={(e) => update({ format: e.target.value || null })}
            rows={3}
            className="w-full rounded-md border border-amber-900/30 bg-burgundy-900/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-600/40"
          />
        </Field>
      </Section>

      {tournamentId && (
        <Section title="Статус">
          <Field label="Статус">
            <NativeSelect
              value={status}
              onChange={setStatus}
              options={STATUS_OPTIONS}
            />
          </Field>
        </Section>
      )}

      <Section title="Структура блайндов">
        <div className="space-y-2">
          {values.levels.map((l, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-amber-900/20 bg-burgundy-900/40 p-3 space-y-2"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-amber-200">
                  {l.isBreak ? `☕ Перерыв ${l.level}` : `Уровень ${l.level}`}
                </span>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1 text-xs text-amber-200/70 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={l.isBreak}
                      onChange={(e) =>
                        updateLevel(idx, { isBreak: e.target.checked })
                      }
                    />
                    Перерыв
                  </label>
                  <button
                    type="button"
                    onClick={() => removeLevel(idx)}
                    className="text-rose-300 hover:text-rose-200 disabled:opacity-40"
                    disabled={values.levels.length <= 1}
                    aria-label="Удалить уровень"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div
                className={`grid gap-2 ${
                  l.isBreak ? "grid-cols-1" : "grid-cols-4"
                }`}
              >
                {!l.isBreak && (
                  <>
                    <Input
                      type="number"
                      placeholder="SB"
                      min={0}
                      value={l.smallBlind}
                      onChange={(e) =>
                        updateLevel(idx, {
                          smallBlind: Number(e.target.value),
                        })
                      }
                    />
                    <Input
                      type="number"
                      placeholder="BB"
                      min={0}
                      value={l.bigBlind}
                      onChange={(e) =>
                        updateLevel(idx, {
                          bigBlind: Number(e.target.value),
                        })
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Ante"
                      min={0}
                      value={l.ante}
                      onChange={(e) =>
                        updateLevel(idx, { ante: Number(e.target.value) })
                      }
                    />
                  </>
                )}
                <Input
                  type="number"
                  placeholder="Минут"
                  min={1}
                  value={l.durationMin}
                  onChange={(e) =>
                    updateLevel(idx, {
                      durationMin: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addLevel}
        >
          <Plus className="w-4 h-4" />
          Добавить уровень
        </Button>
      </Section>

      {error && (
        <div className="rounded-xl border border-rose-700/40 bg-rose-900/40 px-4 py-2 text-rose-100 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-2">
        <Button type="submit" disabled={pending || deleting}>
          {pending
            ? "Сохранение…"
            : tournamentId
            ? "Сохранить"
            : "Создать турнир"}
        </Button>
        {tournamentId && (
          <Button
            type="button"
            variant="destructive"
            disabled={pending || deleting}
            onClick={onDelete}
          >
            {deleting ? "Удаление…" : "Удалить турнир"}
          </Button>
        )}
      </div>
    </form>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-burgundy-800/80 border border-amber-900/20 p-4 space-y-3">
      <h3 className="text-white font-bold text-sm uppercase tracking-wider">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs text-amber-200/70">{label}</span>
      {children}
    </label>
  );
}

function NativeSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-amber-900/30 bg-burgundy-900/40 px-3 py-2 text-sm text-foreground focus:outline-none focus:border-amber-600/40"
    >
      {options.map((o) => (
        <option
          key={o.value}
          value={o.value}
          className="bg-burgundy-900 text-foreground"
        >
          {o.label}
        </option>
      ))}
    </select>
  );
}
