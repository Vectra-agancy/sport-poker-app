"use client";

import { useState, useTransition } from "react";
import { Bell } from "lucide-react";
import { updateNotificationSettings } from "../api/actions";

export interface NotificationSettingsProps {
  initialNotifyTelegram: boolean;
  initialNotifyEmail: boolean;
  hasTelegram: boolean;
  hasEmail: boolean;
}

export function NotificationSettings({
  initialNotifyTelegram,
  initialNotifyEmail,
  hasTelegram,
  hasEmail,
}: NotificationSettingsProps) {
  const [notifyTelegram, setNotifyTelegram] = useState(initialNotifyTelegram);
  const [notifyEmail, setNotifyEmail] = useState(initialNotifyEmail);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const persist = (
    next: { notifyTelegram?: boolean; notifyEmail?: boolean },
    revert: () => void
  ) => {
    setError(null);
    startTransition(async () => {
      const result = await updateNotificationSettings(next);
      if (!result.ok) {
        revert();
        setError(result.error ?? "Не удалось сохранить");
      }
    });
  };

  return (
    <div className="rounded-2xl bg-burgundy-800/80 border border-amber-900/20 p-5">
      <h3 className="text-white font-bold flex items-center gap-2 mb-3">
        <Bell className="w-5 h-5 text-amber-400" />
        Уведомления
      </h3>
      <p className="text-amber-100/60 text-sm mb-4">
        Напоминания о турнирах за 24 часа и за 1 час, оповещения о
        промоушене из листа ожидания.
      </p>

      <Toggle
        label="Telegram"
        sublabel={
          hasTelegram
            ? "В чате с ботом RERAISE CLUB"
            : "Войдите через Telegram, чтобы включить"
        }
        checked={hasTelegram && notifyTelegram}
        disabled={!hasTelegram || pending}
        onChange={(v) => {
          const prev = notifyTelegram;
          setNotifyTelegram(v);
          persist({ notifyTelegram: v }, () => setNotifyTelegram(prev));
        }}
      />

      <div className="h-2" />

      <Toggle
        label="Email"
        sublabel={
          hasEmail
            ? "На привязанный email"
            : "Привяжите email ниже, чтобы включить"
        }
        checked={hasEmail && notifyEmail}
        disabled={!hasEmail || pending}
        onChange={(v) => {
          const prev = notifyEmail;
          setNotifyEmail(v);
          persist({ notifyEmail: v }, () => setNotifyEmail(prev));
        }}
      />

      {error && (
        <div className="mt-3 rounded-md border border-rose-700/40 bg-rose-900/40 px-3 py-2 text-rose-100 text-xs">
          {error}
        </div>
      )}
    </div>
  );
}

function Toggle({
  label,
  sublabel,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  sublabel: string;
  checked: boolean;
  disabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      className={`flex items-center justify-between gap-3 rounded-xl bg-burgundy-900/40 border border-amber-900/10 px-4 py-3 cursor-pointer ${
        disabled ? "opacity-60 cursor-not-allowed" : "active:scale-[0.99]"
      } transition`}
    >
      <div className="flex-1 min-w-0">
        <div className="text-white font-medium text-sm">{label}</div>
        <div className="text-xs text-amber-200/60 truncate">{sublabel}</div>
      </div>
      <span
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border transition ${
          checked
            ? "bg-amber-500/70 border-amber-400/60"
            : "bg-burgundy-900 border-amber-900/30"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
      </span>
    </label>
  );
}
