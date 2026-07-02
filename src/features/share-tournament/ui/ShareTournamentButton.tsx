"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { shareLink } from "@/shared/lib/share";

export interface ShareTournamentButtonProps {
  tournamentId: number;
  tournamentName: string;
}

export function ShareTournamentButton({
  tournamentId,
  tournamentName,
}: ShareTournamentButtonProps) {
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    const result = await shareLink({
      url: `${window.location.origin}/tournament/${tournamentId}`,
      text: `Сыграем? «${tournamentName}» в RERAISE CLUB`,
    });
    if (result === "copied") {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl bg-burgundy-800/80 border border-amber-900/20 p-4 press hover:border-amber-600/40 flex items-center justify-center gap-2"
    >
      {copied ? (
        <>
          <Check className="w-5 h-5 text-emerald-400" />
          <span className="text-white font-medium">Ссылка скопирована</span>
        </>
      ) : (
        <>
          <Share2 className="w-5 h-5 text-amber-400" />
          <span className="text-white font-medium">Позвать друзей за стол</span>
        </>
      )}
    </button>
  );
}
