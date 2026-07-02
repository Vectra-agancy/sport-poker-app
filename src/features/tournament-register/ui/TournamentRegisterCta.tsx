"use client";

import { useState, useTransition } from "react";
import { Loader2, Ticket } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import {
  cancelRegistration,
  registerToTournament,
} from "../api/actions";

export interface TournamentRegisterCtaProps {
  tournamentId: number;
  ticketPrice: number;
  initialRegistered?: boolean;
  initialWaitlist?: boolean;
  initialUsedFreeTicket?: boolean;
  availableFreeTickets?: number;
}

export function TournamentRegisterCta({
  tournamentId,
  ticketPrice,
  initialRegistered = false,
  initialWaitlist = false,
  initialUsedFreeTicket = false,
  availableFreeTickets = 0,
}: TournamentRegisterCtaProps) {
  const [registered, setRegistered] = useState(initialRegistered);
  const [waitlist, setWaitlist] = useState(initialWaitlist);
  const [usedFreeTicket, setUsedFreeTicket] = useState(
    initialUsedFreeTicket
  );
  // Default the toggle to ON when the user has tickets and hasn't registered yet.
  const [useTicket, setUseTicket] = useState(
    !initialRegistered && availableFreeTickets > 0
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const ticketsAvailable = availableFreeTickets > 0;

  const onClick = () => {
    setError(null);
    startTransition(async () => {
      const result = registered
        ? await cancelRegistration(tournamentId)
        : await registerToTournament(tournamentId, {
            useFreeTicket: useTicket && ticketsAvailable,
          });
      if (!result.ok) {
        setError(result.error ?? "Что-то пошло не так");
        return;
      }
      if (registered) {
        setRegistered(false);
        setWaitlist(false);
        setUsedFreeTicket(false);
      } else {
        setRegistered(true);
        setWaitlist(result.status === "waitlist");
        setUsedFreeTicket(useTicket && ticketsAvailable);
      }
    });
  };

  let ctaLabel: string | null;
  if (pending) {
    ctaLabel = null;
  } else if (registered) {
    ctaLabel = waitlist ? "Уйти из листа ожидания" : "Отменить участие";
  } else if (useTicket && ticketsAvailable) {
    ctaLabel = "Участвовать (бесплатный билет)";
  } else {
    ctaLabel = `Участвовать · ${ticketPrice.toLocaleString()}₽`;
  }

  return (
    <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+6rem)] left-0 right-0 px-4 z-30 max-w-md mx-auto space-y-2">
      {error && (
        <div className="rounded-xl border border-rose-700/40 bg-rose-900/40 px-4 py-2 text-rose-100 text-sm text-center">
          {error}
        </div>
      )}

      {!registered && ticketsAvailable && (
        <label className="flex items-center justify-between gap-3 rounded-xl border border-amber-700/40 bg-amber-900/30 px-4 py-2.5 cursor-pointer active:scale-[0.99] transition">
          <span className="flex items-center gap-2 text-sm text-amber-100">
            <Ticket className="w-4 h-4 text-amber-400" />
            Бесплатный билет
            <span className="text-xs text-amber-200/70">
              · доступно: {availableFreeTickets}
            </span>
          </span>
          <input
            type="checkbox"
            checked={useTicket}
            onChange={(e) => setUseTicket(e.target.checked)}
            className="w-4 h-4 accent-amber-500"
          />
        </label>
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
        <div className="text-center text-amber-200/70 text-xs">
          Вы в листе ожидания. Если место освободится — придёт уведомление.
        </div>
      )}
      {registered && usedFreeTicket && !pending && (
        <div className="text-center text-amber-200/70 text-xs">
          Использован бесплатный билет. При отмене он вернётся.
        </div>
      )}
    </div>
  );
}
