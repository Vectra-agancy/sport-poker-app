"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Logo } from "@/shared/ui";

export interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export function Header({ title, showBack = false, onBack }: HeaderProps) {
  const router = useRouter();
  const handleBack = onBack ?? (() => router.back());
  return (
    <div
      className="px-4 pt-6 pb-4 sticky top-0 z-20"
      style={{
        background: "linear-gradient(180deg, #1a0a0c 70%, transparent 100%)",
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <Logo size="sm" />
        <span className="font-serif text-amber-200/90 text-lg tracking-widest">
          RERAISE CLUB
        </span>
      </div>
      {title && (
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              type="button"
              onClick={handleBack}
              className="w-10 h-10 rounded-full bg-burgundy-800 border border-amber-900/30 flex items-center justify-center active:scale-95 transition"
              aria-label="Назад"
            >
              <ChevronLeft className="w-5 h-5 text-amber-200" />
            </button>
          )}
          <h1 className="text-2xl font-bold text-white">{title}</h1>
        </div>
      )}
    </div>
  );
}
