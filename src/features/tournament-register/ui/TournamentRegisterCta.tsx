"use client";

import { useState } from "react";
import { cn } from "@/shared/lib/utils";

export interface TournamentRegisterCtaProps {
  tournamentId: number;
  initialRegistered?: boolean;
}

export function TournamentRegisterCta({
  initialRegistered = false,
}: TournamentRegisterCtaProps) {
  const [registered, setRegistered] = useState(initialRegistered);

  return (
    <div className="fixed bottom-24 left-0 right-0 px-4 z-30 max-w-md mx-auto">
      <button
        type="button"
        onClick={() => setRegistered((r) => !r)}
        className={cn(
          "w-full py-4 rounded-2xl font-bold text-lg shadow-2xl active:scale-[0.98] transition",
          registered
            ? "bg-burgundy-800/90 border border-rose-700/40 text-rose-200 shadow-rose-900/30"
            : "bg-gradient-to-r from-amber-500 to-amber-400 text-black shadow-amber-500/30"
        )}
      >
        {registered ? "Отменить участие" : "Участвовать"}
      </button>
    </div>
  );
}
