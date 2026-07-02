"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/utils";

const ITEMS = [
  { href: "/admin", label: "Дашборд", exact: true },
  { href: "/admin/tournaments", label: "Турниры" },
  { href: "/admin/players", label: "Игроки" },
  { href: "/admin/seasons", label: "Сезоны" },
  { href: "/admin/achievements", label: "Достижения" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-4 -mx-4 px-4 flex gap-2 overflow-x-auto scrollbar-none text-sm">
      {ITEMS.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "whitespace-nowrap rounded-lg px-3 py-1.5 border transition",
              active
                ? "bg-amber-500/20 border-amber-500/40 text-amber-200"
                : "border-amber-900/20 text-amber-100/70 hover:text-amber-200 hover:border-amber-600/40"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
