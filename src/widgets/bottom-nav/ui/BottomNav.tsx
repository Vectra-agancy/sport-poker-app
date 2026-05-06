"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  // When the URL settles on the optimistic target, drop pending state.
  useEffect(() => {
    if (pendingHref && pathname.startsWith(pendingHref === "/" ? "/" : pendingHref)) {
      const item = NAV_ITEMS.find((i) => i.href === pendingHref);
      if (item?.match(pathname)) {
        setPendingHref(null);
      }
    }
  }, [pathname, pendingHref]);

  const activePath = pendingHref ?? pathname;

  return (
    <div className="fixed bottom-3 left-0 right-0 px-4 z-40 max-w-md mx-auto">
      <div className="rounded-2xl bg-burgundy-900/95 backdrop-blur-lg border border-amber-900/30 p-1.5 flex shadow-2xl">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.match(activePath);
          const showSpinner = isPending && pendingHref === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) {
                  return;
                }
                e.preventDefault();
                if (item.match(pathname)) return;
                setPendingHref(item.href);
                startTransition(() => router.push(item.href));
              }}
              className={cn(
                "flex-1 py-2.5 rounded-xl flex flex-col items-center gap-0.5 transition-colors duration-150 active:scale-[0.96]",
                active
                  ? "bg-gradient-to-br from-amber-700/60 to-amber-900/60"
                  : ""
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 transition-opacity",
                  active ? "text-amber-200" : "text-amber-200/40",
                  showSpinner && "animate-pulse"
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
