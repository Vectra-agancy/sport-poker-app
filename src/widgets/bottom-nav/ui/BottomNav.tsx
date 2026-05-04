"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Home, Trophy, User } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Главная", match: (p: string) => p === "/" },
  {
    href: "/calendar",
    icon: Calendar,
    label: "Календарь",
    match: (p: string) => p.startsWith("/calendar"),
  },
  {
    href: "/rating",
    icon: Trophy,
    label: "Рейтинг",
    match: (p: string) => p.startsWith("/rating"),
  },
  {
    href: "/profile",
    icon: User,
    label: "Профиль",
    match: (p: string) => p.startsWith("/profile"),
  },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <div className="fixed bottom-3 left-0 right-0 px-4 z-40 max-w-md mx-auto">
      <div className="rounded-2xl bg-burgundy-900/95 backdrop-blur-lg border border-amber-900/30 p-1.5 flex shadow-2xl">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex-1 py-2.5 rounded-xl flex flex-col items-center gap-0.5 transition",
                active
                  ? "bg-gradient-to-br from-amber-700/60 to-amber-900/60"
                  : ""
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5",
                  active ? "text-amber-200" : "text-amber-200/40"
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-medium",
                  active ? "text-amber-200" : "text-amber-200/40"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
