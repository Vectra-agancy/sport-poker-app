"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        ready: () => void;
        expand: () => void;
        openTelegramLink?: (url: string) => void;
      };
    };
  }
}

export interface ShareReferralButtonProps {
  referralCode: string;
}

export function ShareReferralButton({
  referralCode,
}: ShareReferralButtonProps) {
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    const link = `${window.location.origin}/r/${encodeURIComponent(
      referralCode
    )}`;
    const message = `Заходи в RERAISE CLUB по моей ссылке: ${link}`;

    const tg = window.Telegram?.WebApp;
    if (tg?.openTelegramLink) {
      // Open native Telegram share sheet inside the Mini App.
      tg.openTelegramLink(
        `https://t.me/share/url?url=${encodeURIComponent(
          link
        )}&text=${encodeURIComponent("Заходи в RERAISE CLUB")}`
      );
      return;
    }

    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback for non-secure contexts: use a temp textarea.
      const ta = document.createElement("textarea");
      ta.value = message;
      ta.style.position = "fixed";
      ta.style.left = "-1000px";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      } catch {
        // Last resort: do nothing, user sees no state change.
      } finally {
        document.body.removeChild(ta);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full py-3 rounded-xl bg-amber-500 text-black font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition"
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
