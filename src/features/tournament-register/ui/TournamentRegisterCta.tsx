"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import {
  cancelRegistration,
  registerToTournament,
} from "../api/actions";

export interface TournamentRegisterCtaProps {
  tournamentId: number;
  initialRegistered?: boolean;
  initialWaitlist?: boolean;
}

export function TournamentRegisterCta({
  tournamentId,
  initialRegistered = false,
  initialWaitlist = false,
}: TournamentRegisterCtaProps) {
  const [registered, setRegistered] = useState(initialRegistered);
  const [waitlist, setWaitlist] = useState(initialWaitlist);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onClick = () => {
    setError(null);
    startTransition(async () => {
      const action = registered ? cancelRegistration : registerToTournament;
      const result = await action(tournamentId);
      if (!result.ok) {
        setError(result.error ?? "Что-то пошло не так");
        return;
      }
      if (registered) {
        setRegistered(false);
        setWaitlist(false);
      } else {
        setRegistered(true);
        setWaitlist(result.status === "waitlist");
      }
    });
  };

  const ctaLabel = pending
    ? null
    : registered
    ? waitlist
      ? "Уйти из листа ожидания"
      : "Отменить участие"
    : "Участвовать";

  return (
    <div className="fixed bottom-24 left-0 right-0 px-4 z-30 max-w-md mx-auto">
      {error && (
        <div className="mb-2 rounded-xl border border-rose-700/40 bg-rose-900/40 px-4 py-2 text-rose-100 text-sm text-center">
          {error}
        </div>
      )}
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className={cn(
          "w-full py-4 rounded-2xl font-bold text-lg shadow-2xl active:scale-[0.98] transition disabled:opacity-70 disabled:cursor-wait",
          registered
            ? "bg-burgundy-800/90 border border-rose-700/40 text-rose-200 shadow-rose-900/30"
            : "bg-gradient-to-r from-amber-500 to-amber-400 text-black shadow-amber-500/30"
        )}
      >
        {pending ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Подождите…
          </span>
        ) : (
          ctaLabel
        )}
      </button>
      {registered && waitlist && !pending && (
        <div className="mt-2 text-center text-amber-200/70 text-xs">
          Вы в листе ожидания. Если место освободится — придёт уведомление.
        </div>
      )}
    </div>
  );
}
