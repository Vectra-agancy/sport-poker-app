"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";
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

export function RatingScopeTabs({
  initialScope,
  initialRows,
}: RatingScopeTabsProps) {
  const router = useRouter();
  const [scope, setScope] = useState<RatingScope>(initialScope);
  const [search, setSearch] = useState("");
  const [pending, startTransition] = useTransition();

  // Сервер прислал новый scope (после SPA-навигации) — синхронизируем вкладку.
  useEffect(() => {
    setScope(initialScope);
  }, [initialScope]);

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
          // SPA-навигация вместо полной перезагрузки: сервер отдаст свежие
          // строки, а вкладки/скролл останутся на месте.
          startTransition(() => {
            router.push(next === "global" ? "/rating" : `/rating?scope=${next}`);
          });
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
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-burgundy-800/80 border border-amber-900/20 text-white placeholder:text-amber-200/30 focus:outline-none focus:border-amber-600/40 transition-colors"
        />
      </div>

      <div
        className={cn(
          "transition-opacity duration-200",
          pending && "opacity-50 animate-pulse"
        )}
      >
        {filtered.length > 3 ? (
          <div className="mt-4">
            <RatingTable rows={filtered.slice(3)} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-4 rounded-2xl bg-burgundy-800/60 border border-amber-900/20 p-6 text-center text-amber-200/50 text-sm animate-fade-in">
            {emptyMessage(scope, Boolean(search.trim()))}
          </div>
        ) : null}
      </div>
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
