"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui";
import type { RatingRow, RatingScope } from "@/entities/rating";
import { RatingTable } from "@/widgets/rating-table";

const SCOPES: { id: RatingScope; label: string }[] = [
  { id: "global", label: "Глобальный" },
  { id: "season", label: "Сезон" },
  { id: "friends", label: "Друзья" },
];

export interface RatingScopeTabsProps {
  initialScope: RatingScope;
  initialRows: RatingRow[];
}

export function RatingScopeTabs({ initialScope, initialRows }: RatingScopeTabsProps) {
  const [scope, setScope] = useState<RatingScope>(initialScope);
  const [search, setSearch] = useState("");

  // For non-global scopes, navigate via URL search param so SSR fetches fresh data.
  // Local search filtering is in-memory.
  const filtered = search.trim()
    ? initialRows.filter((r) =>
        r.name.toLowerCase().includes(search.toLowerCase().trim())
      )
    : initialRows;

  return (
    <>
      <Tabs
        value={scope}
        onValueChange={(v) => {
          const next = v as RatingScope;
          setScope(next);
          const url = new URL(window.location.href);
          if (next === "global") {
            url.searchParams.delete("scope");
          } else {
            url.searchParams.set("scope", next);
          }
          window.location.href = url.toString();
        }}
      >
        <TabsList>
          {SCOPES.map((s) => (
            <TabsTrigger key={s.id} value={s.id}>
              {s.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="relative mt-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400/60 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по никнейму"
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-burgundy-800/80 border border-amber-900/20 text-white placeholder:text-amber-200/30 focus:outline-none focus:border-amber-600/40"
        />
      </div>

      {filtered.length > 3 ? (
        <div className="mt-4">
          <RatingTable rows={filtered.slice(3)} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-4 rounded-2xl bg-burgundy-800/60 border border-amber-900/20 p-6 text-center text-amber-200/50 text-sm">
          {emptyMessage(scope, Boolean(search.trim()))}
        </div>
      ) : null}
    </>
  );
}

function emptyMessage(scope: RatingScope, isSearching: boolean): string {
  if (isSearching) return "Никого не нашлось";
  if (scope === "friends") {
    return "Вы ещё ни на кого не подписаны. Откройте профиль игрока, чтобы подписаться.";
  }
  if (scope === "season") {
    return "В этом сезоне ещё нет данных рейтинга.";
  }
  return "Рейтинг ещё не сформирован — сыграйте первый турнир.";
}
