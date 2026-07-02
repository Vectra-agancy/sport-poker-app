import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Send } from "lucide-react";
import { Header } from "@/widgets/header";
import { Logo } from "@/shared/ui";
import { EmailLoginForm } from "@/features/bind-email";
import { auth } from "@/shared/api/auth";

export const metadata: Metadata = {
  title: "Вход",
  robots: { index: false, follow: false },
};

const SUITS = [
  { char: "♠", className: "top-3 left-5 text-3xl text-amber-200/15", delay: "0s" },
  { char: "♥", className: "top-10 right-8 text-2xl text-rose-400/20", delay: "0.6s" },
  { char: "♦", className: "bottom-8 left-10 text-2xl text-rose-400/15", delay: "1.2s" },
  { char: "♣", className: "bottom-4 right-6 text-3xl text-amber-200/10", delay: "1.8s" },
];

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/profile");

  return (
    <div className="pb-12">
      <Header title="Вход" />
      <div className="px-4 space-y-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-burgundy-700 to-burgundy-800 border border-amber-900/30 p-6 animate-rise-up">
          {/* Мягкое золотое свечение и парящие масти */}
          <div className="pointer-events-none absolute -top-16 left-1/2 h-40 w-56 -translate-x-1/2 rounded-full bg-amber-500/15 blur-3xl animate-glow-pulse" />
          {SUITS.map((s) => (
            <span
              key={s.char}
              aria-hidden
              className={`pointer-events-none absolute select-none animate-float ${s.className}`}
              style={{ animationDelay: s.delay }}
            >
              {s.char}
            </span>
          ))}

          <div className="relative flex flex-col items-center text-center">
            <Logo size="lg" className="animate-pop-in" />
            <h1 className="mt-4 text-2xl font-bold text-white">
              Добро пожаловать в{" "}
              <span className="bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent whitespace-nowrap">
                RERAISE CLUB
              </span>
            </h1>
            <p className="mt-2 text-amber-100/70 text-sm leading-relaxed max-w-xs text-balance">
              Спортивный покер: турниры, рейтинг, достижения и своя лига
              друзей.
            </p>
          </div>
        </div>

        <div
          className="rounded-2xl bg-burgundy-800/80 border border-amber-900/20 p-4 flex items-start gap-3 animate-rise-up"
          style={{ animationDelay: "80ms" }}
        >
          <div className="w-10 h-10 shrink-0 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center">
            <Send className="w-5 h-5 text-sky-300" />
          </div>
          <div className="text-sm">
            <div className="text-white font-medium">Через Telegram</div>
            <div className="text-amber-200/60 mt-0.5">
              Откройте приложение через нашего Telegram-бота — вход произойдёт
              автоматически.
            </div>
          </div>
        </div>

        <div className="animate-rise-up" style={{ animationDelay: "160ms" }}>
          <EmailLoginForm />
        </div>
      </div>
    </div>
  );
}
