"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2, UserPlus } from "lucide-react";
import { Button, Input, NativeSelect } from "@/shared/ui";
import {
  addRegistration,
  removeRegistration,
  searchPlayersToAdd,
  setRegistrationStatus,
  type PlayerSearchItem,
} from "../api/actions";

export const REGISTRATION_STATUS_OPTIONS = [
  { value: "registered", label: "Записан" },
  { value: "waitlist", label: "Лист ожидания" },
  { value: "attended", label: "Пришёл" },
  { value: "no_show", label: "Не пришёл" },
  { value: "cancelled", label: "Отменена" },
];

export interface RegistrationItem {
  id: number;
  status: string;
  usedFreeTicket: boolean;
  createdAt: string;
  user: { id: number; nickname: string };
}

export function RegistrationsManager({
  tournamentId,
  registrations,
}: {
  tournamentId: number;
  registrations: RegistrationItem[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [query, setQuery] = useState("");
  const [found, setFound] = useState<PlayerSearchItem[]>([]);
  const [searching, setSearching] = useState(false);

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setError(null);
    startTransition(async () => {
      const result = await fn();
      if (!result.ok) {
        setError(result.error ?? "Что-то пошло не так");
        return;
      }
      router.refresh();
    });
  };

  const onSearch = async (value: string) => {
    setQuery(value);
    if (value.trim().length < 2) {
      setFound([]);
      return;
    }
    setSearching(true);
    try {
      setFound(await searchPlayersToAdd(tournamentId, value));
    } finally {
      setSearching(false);
    }
  };

  const onAdd = (userId: number) => {
    setQuery("");
    setFound([]);
    run(() => addRegistration(tournamentId, userId));
  };

  return (
    <div className="space-y-4">
      <section className="rounded-2xl bg-burgundy-800/80 border border-amber-900/20 p-4 space-y-2">
        <h3 className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-amber-300" />
          Добавить игрока
        </h3>
        <Input
          value={query}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Ник или email (минимум 2 символа)…"
        />
        {searching && (
          <div className="text-xs text-amber-200/60">Поиск…</div>
        )}
        {found.length > 0 && (
          <div className="rounded-lg border border-amber-900/20 divide-y divide-amber-900/20 overflow-hidden">
            {found.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onAdd(p.id)}
                disabled={pending}
                className="flex w-full items-center justify-between px-3 py-2 text-sm text-white bg-burgundy-900/40 hover:bg-burgundy-900/80 transition disabled:opacity-50"
              >
                <span>{p.nickname}</span>
                <span className="text-amber-300 text-xs">Добавить +</span>
              </button>
            ))}
          </div>
        )}
        {!searching && query.trim().length >= 2 && found.length === 0 && (
          <div className="text-xs text-amber-200/60">
            Никого не нашли — либо игрок уже записан.
          </div>
        )}
      </section>

      <section className="space-y-2">
        {registrations.length === 0 && (
          <div className="rounded-xl border border-amber-900/20 bg-burgundy-800/40 p-4 text-amber-200/60 text-sm">
            Регистраций пока нет.
          </div>
        )}
        {registrations.map((r) => (
          <div
            key={r.id}
            className="rounded-xl bg-burgundy-800/80 border border-amber-900/20 p-3 space-y-2"
          >
            <div className="flex items-center justify-between gap-3">
              <Link
                href={`/admin/players/${r.user.id}`}
                className="text-white font-medium truncate hover:text-amber-200 transition"
              >
                {r.user.nickname}
              </Link>
              <button
                type="button"
                onClick={() => {
                  if (
                    confirm(
                      `Удалить регистрацию игрока ${r.user.nickname}? Это действие нельзя отменить.`
                    )
                  ) {
                    run(() => removeRegistration(r.id));
                  }
                }}
                disabled={pending}
                className="text-rose-300 hover:text-rose-200 disabled:opacity-40"
                aria-label="Удалить регистрацию"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <NativeSelect
                value={r.status}
                disabled={pending}
                onChange={(status) =>
                  run(() => setRegistrationStatus(r.id, status))
                }
                options={REGISTRATION_STATUS_OPTIONS}
                className="max-w-[220px]"
              />
              <span className="text-xs text-amber-200/50">
                {r.usedFreeTicket ? "🎟 бесплатный билет · " : ""}
                {r.createdAt}
              </span>
            </div>
          </div>
        ))}
      </section>

      {error && (
        <div className="rounded-xl border border-rose-700/40 bg-rose-900/40 px-4 py-2 text-rose-100 text-sm">
          {error}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() => router.refresh()}
      >
        Обновить список
      </Button>
    </div>
  );
}
