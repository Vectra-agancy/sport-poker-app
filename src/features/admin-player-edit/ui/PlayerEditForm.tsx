"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, NativeSelect } from "@/shared/ui";
import { TIER_LABELS } from "@/entities/user";
import {
  deletePlayer,
  updatePlayer,
  type PlayerFormValues,
} from "../api/actions";

const TIER_OPTIONS = Object.entries(TIER_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export function PlayerEditForm({
  playerId,
  initial,
  hasTelegram,
}: {
  playerId: number;
  initial: PlayerFormValues;
  hasTelegram: boolean;
}) {
  const router = useRouter();
  const [values, setValues] = useState<PlayerFormValues>(initial);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const [deleting, startDelete] = useTransition();

  const update = (patch: Partial<PlayerFormValues>) => {
    setSaved(false);
    setValues((v) => ({ ...v, ...patch }));
  };

  const onSubmit = () => {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updatePlayer(playerId, values);
      if (!result.ok) {
        setError(result.error ?? "Что-то пошло не так");
        return;
      }
      setSaved(true);
      router.refresh();
    });
  };

  const onDelete = () => {
    if (
      !confirm(
        "Удалить игрока? Будут удалены все его регистрации, результаты и достижения. Это действие нельзя отменить."
      )
    ) {
      return;
    }
    setError(null);
    startDelete(async () => {
      const result = await deletePlayer(playerId);
      if (!result.ok) {
        setError(result.error ?? "Не удалось удалить");
        return;
      }
      router.push("/admin/players");
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
      <Section title="Профиль">
        <Field label="Ник">
          <Input
            value={values.nickname}
            onChange={(e) => update({ nickname: e.target.value })}
            required
          />
        </Field>
        <Field label="Email (пусто — отвязать)">
          <Input
            type="email"
            value={values.email ?? ""}
            onChange={(e) => update({ email: e.target.value || null })}
            placeholder="player@example.com"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Тир">
            <NativeSelect
              value={values.tier}
              onChange={(tier) => update({ tier })}
              options={TIER_OPTIONS}
            />
          </Field>
          <Field label="Бесплатные билеты">
            <Input
              type="number"
              min={0}
              max={999}
              value={values.freeTickets}
              onChange={(e) =>
                update({ freeTickets: Number(e.target.value) })
              }
            />
          </Field>
        </div>
      </Section>

      <Section title="Права и уведомления">
        <Toggle
          label="Админ"
          hint="Доступ к этой панели (сейчас админами временно являются все)"
          checked={values.isAdmin}
          onChange={(isAdmin) => update({ isAdmin })}
        />
        <Toggle
          label="Уведомления в Telegram"
          hint={hasTelegram ? undefined : "Telegram не привязан"}
          checked={values.notifyTelegram}
          onChange={(notifyTelegram) => update({ notifyTelegram })}
        />
        <Toggle
          label="Уведомления на email"
          hint={values.email ? undefined : "Email не привязан"}
          checked={values.notifyEmail}
          onChange={(notifyEmail) => update({ notifyEmail })}
        />
      </Section>

      {error && (
        <div className="rounded-xl border border-rose-700/40 bg-rose-900/40 px-4 py-2 text-rose-100 text-sm">
          {error}
        </div>
      )}
      {saved && !error && (
        <div className="rounded-xl border border-emerald-700/40 bg-emerald-900/40 px-4 py-2 text-emerald-100 text-sm">
          Сохранено
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-2">
        <Button type="submit" disabled={pending || deleting}>
          {pending ? "Сохранение…" : "Сохранить"}
        </Button>
        <Button
          type="button"
          variant="destructive"
          disabled={pending || deleting}
          onClick={onDelete}
        >
          {deleting ? "Удаление…" : "Удалить игрока"}
        </Button>
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

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5"
      />
      <span>
        <span className="block text-sm text-white">{label}</span>
        {hint && (
          <span className="block text-xs text-amber-200/50">{hint}</span>
        )}
      </span>
    </label>
  );
}
