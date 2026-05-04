"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Header } from "@/widgets/header";
import { RatingPodium } from "@/widgets/rating-podium";
import { RatingTable } from "@/widgets/rating-table";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui";
import { MOCK_RATING, type RatingScope } from "@/entities/rating";

const SCOPES: { id: RatingScope; label: string }[] = [
  { id: "global", label: "Глобальный" },
  { id: "season", label: "Сезон" },
  { id: "friends", label: "Друзья" },
];

export function RatingPage() {
  const [scope, setScope] = useState<RatingScope>("global");
  const [search, setSearch] = useState("");

  const filtered = search
    ? MOCK_RATING.filter((r) =>
        r.name.toLowerCase().includes(search.toLowerCase())
      )
    : MOCK_RATING;
  void scope;

  return (
    <div className="pb-28">
      <Header title="Рейтинг" />
      <div className="px-4 space-y-4">
        <Tabs value={scope} onValueChange={(v) => setScope(v as RatingScope)}>
          <TabsList>
            {SCOPES.map((s) => (
              <TabsTrigger key={s.id} value={s.id}>
                {s.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400/60 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по никнейму"
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-burgundy-800/80 border border-amber-900/20 text-white placeholder:text-amber-200/30 focus:outline-none focus:border-amber-600/40"
          />
        </div>

        <RatingPodium top3={MOCK_RATING.slice(0, 3)} variant="podium" />

        <div className="rounded-2xl bg-gradient-to-r from-amber-900/30 to-amber-950/30 border border-amber-600/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-amber-200/60 uppercase tracking-wider mb-1">
                Ваша позиция
              </div>
              <div className="text-2xl font-bold text-white">#45</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-amber-200/60">До #44 нужно</div>
              <div className="text-amber-300 font-bold">23 очка</div>
            </div>
          </div>
        </div>

        <RatingTable rows={filtered.slice(3)} />
      </div>
    </div>
  );
}
