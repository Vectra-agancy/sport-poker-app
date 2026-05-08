"use client";

import { useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

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

interface TelegramAuthBridgeProps {
  isAuthenticated: boolean;
}

export function TelegramAuthBridge({
  isAuthenticated,
}: TelegramAuthBridgeProps) {
  const router = useRouter();
  const initRef = useRef(false);
  const triedRef = useRef(false);

  useEffect(() => {
    const webApp = window.Telegram?.WebApp;
    if (!webApp) return;

    if (!initRef.current) {
      initRef.current = true;
      webApp.ready();
      webApp.expand();
    }

    if (isAuthenticated || triedRef.current) return;
    if (!webApp.initData) return;

    triedRef.current = true;

    void (async () => {
      const result = await signIn("telegram", {
        initData: webApp.initData,
        redirect: false,
      });
      if (result?.ok) {
        router.refresh();
      } else {
        console.error(
          "[telegram-auth] sign-in failed",
          result?.error ?? "unknown"
        );
      }
    })();
  }, [isAuthenticated, router]);

  return null;
}
