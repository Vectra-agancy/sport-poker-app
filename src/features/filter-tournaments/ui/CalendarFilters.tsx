"use client";

import { Tabs, TabsList, TabsTrigger } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";
import { TOURNAMENT_TYPES, type TournamentType } from "@/entities/tournament";

export type CalendarFilter = "upcoming" | "past" | "all";

export interface CalendarFiltersProps {
  filter: CalendarFilter;
  onFilterChange: (f: CalendarFilter) => void;
  activeTypes: TournamentType[];
  onToggleType: (t: TournamentType) => void;
}

const FILTERS: { id: CalendarFilter; label: string }[] = [
  { id: "upcoming", label: "Предстоящие" },
  { id: "past", label: "Прошедшие" },
  { id: "all", label: "Все" },
];

export function CalendarFilters({
  filter,
  onFilterChange,
  activeTypes,
  onToggleType,
}: CalendarFiltersProps) {
  return (
    <div className="space-y-3">
      <Tabs
        value={filter}
        onValueChange={(v) => onFilterChange(v as CalendarFilter)}
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
        {(
          Object.entries(TOURNAMENT_TYPES) as [
            TournamentType,
            (typeof TOURNAMENT_TYPES)[TournamentType],
          ][]
        ).map(([key, t]) => {
          const active = activeTypes.includes(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => onToggleType(key)}
              aria-pressed={active}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap press",
                active
                  ? t.className
                  : "border-amber-900/30 text-amber-200/40 hover:text-amber-200/70"
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
