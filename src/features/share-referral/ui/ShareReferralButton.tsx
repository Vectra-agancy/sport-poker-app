"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { shareLink } from "@/shared/lib/share";

export interface ShareReferralButtonProps {
  referralCode: string;
}

export function ShareReferralButton({
  referralCode,
}: ShareReferralButtonProps) {
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    const result = await shareLink({
      url: `${window.location.origin}/r/${encodeURIComponent(referralCode)}`,
      text: "Заходи в RERAISE CLUB",
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
      className="w-full py-3 rounded-xl bg-amber-500 text-black font-bold flex items-center justify-center gap-2 press"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" />
          Ссылка скопирована
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" />
          Поделиться ссылкой
        </>
      )}
    </button>
  );
}
