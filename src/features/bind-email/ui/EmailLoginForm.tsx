"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button, Input } from "@/shared/ui";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EmailLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const sendCode = () => {
    setError(null);
    setInfo(null);
    if (!EMAIL_REGEX.test(email.trim())) {
      setError("Введите корректный email");
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/email/send-code", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email: email.trim() }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          retryAfter?: number;
          devNote?: string;
        };
        if (!res.ok) {
          if (data.error === "rate_limited") {
            setError(
              `Подождите ${data.retryAfter ?? 30} сек перед повтором`
            );
          } else if (data.error === "invalid_email") {
            setError("Неверный email");
          } else {
            setError("Не удалось отправить код. Попробуйте позже.");
          }
          return;
        }
        setStep("code");
        if (data.devNote) {
          setInfo("Код напечатан в логах сервера (dev-режим)");
        } else {
          setInfo("Код отправлен на email");
        }
      } catch {
        setError("Сеть недоступна");
      }
    });
  };

  const signInWithCode = () => {
    setError(null);
    if (!/^\d+$/.test(code.trim())) {
      setError("Код состоит из цифр");
      return;
    }
    startTransition(async () => {
      const result = await signIn("email-otp", {
        email: email.trim(),
        code: code.trim(),
        redirect: false,
      });
      if (!result?.ok) {
        setError("Неверный или просроченный код");
        return;
      }
      router.push("/profile");
      router.refresh();
    });
  };

  return (
    <div className="rounded-2xl bg-burgundy-800/80 border border-amber-900/20 p-5">
      <h3 className="text-white font-bold mb-2">Вход по email</h3>
      <p className="text-amber-100/60 text-sm mb-3">
        Получите 6-значный код на почту.
      </p>

      {step === "email" && (
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={pending}
          />
          <Button type="button" onClick={sendCode} disabled={pending}>
            {pending ? "..." : "Получить код"}
          </Button>
        </div>
      )}

      {step === "code" && (
        <div className="space-y-2">
          <div className="text-xs text-amber-200/60">
            Код отправлен на {email}
          </div>
          <div className="flex gap-2">
            <Input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="6-значный код"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 8))
              }
              disabled={pending}
            />
            <Button type="button" onClick={signInWithCode} disabled={pending}>
              {pending ? "..." : "Войти"}
            </Button>
          </div>
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setCode("");
              setError(null);
              setInfo(null);
            }}
            className="text-xs text-amber-300/80 hover:text-amber-200 underline-offset-4 hover:underline"
            disabled={pending}
          >
            Изменить email
          </button>
        </div>
      )}

      {info && (
        <div className="mt-3 rounded-md border border-amber-700/40 bg-amber-900/30 px-3 py-2 text-amber-100 text-xs">
          {info}
        </div>
      )}
      {error && (
        <div className="mt-3 rounded-md border border-rose-700/40 bg-rose-900/40 px-3 py-2 text-rose-100 text-xs">
          {error}
        </div>
      )}
    </div>
  );
}
