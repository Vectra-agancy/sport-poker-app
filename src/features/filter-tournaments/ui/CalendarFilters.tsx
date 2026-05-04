"use client";

import { useState } from "react";
import { ChevronDown, Layers } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui";
import { TOURNAMENT_TYPES } from "@/entities/tournament";

export type CalendarFilter = "all" | "upcoming" | "past";

export interface CalendarFiltersProps {
  initialFilter?: CalendarFilter;
  onFilterChange?: (f: CalendarFilter) => void;
}

const FILTERS: { id: CalendarFilter; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "upcoming", label: "Предстоящие" },
  { id: "past", label: "Прошедшие" },
];

export function CalendarFilters({
  initialFilter = "all",
  onFilterChange,
}: CalendarFiltersProps) {
  const [filter, setFilter] = useState<CalendarFilter>(initialFilter);

  return (
    <div className="space-y-3">
      <Tabs
        value={filter}
        onValueChange={(v) => {
          setFilter(v as CalendarFilter);
          onFilterChange?.(v as CalendarFilter);
        }}
      >
        <TabsList>
          {FILTERS.map((f) => (
            <TabsTrigger key={f.id} value={f.id}>
              {f.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
        {Object.entries(TOURNAMENT_TYPES).map(([key, t]) => (
          <button
            key={key}
            type="button"
            className={`px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap ${t.className}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        className="w-full rounded-2xl bg-burgundy-800/80 border border-amber-900/20 p-3.5 flex items-center justify-between active:scale-[0.99] transition"
      >
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-amber-400" />
          <span className="text-white font-medium">Майский сезон</span>
        </div>
        <ChevronDown className="w-5 h-5 text-amber-400" />
      </button>
    </div>
  );
}
