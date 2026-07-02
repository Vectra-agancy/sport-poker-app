"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarX2 } from "lucide-react";
import { Header } from "@/widgets/header";
import {
  CalendarFilters,
  type CalendarFilter,
} from "@/features/filter-tournaments";
import {
  TournamentCard,
  type Tournament,
  type TournamentType,
} from "@/entities/tournament";

export interface CalendarPageProps {
  tournaments: Tournament[];
}

function isPast(t: Tournament, now: number): boolean {
  if (t.status === "finished" || t.status === "cancelled") return true;
  if (t.status === "in_progress") return false;
  return new Date(t.startsAtIso).getTime() < now;
}

export function CalendarPage({ tournaments }: CalendarPageProps) {
  const [filter, setFilter] = useState<CalendarFilter>("upcoming");
  const [activeTypes, setActiveTypes] = useState<TournamentType[]>([]);

  const filtered = useMemo(() => {
    const now = Date.now();
    let list = tournaments;
    if (filter === "upcoming") {
      list = list.filter((t) => !isPast(t, now));
    } else if (filter === "past") {
      // Прошедшие удобнее читать от свежих к старым
      list = [...list.filter((t) => isPast(t, now))].reverse();
    }
    if (activeTypes.length > 0) {
      list = list.filter((t) => activeTypes.includes(t.type));
    }
    return list;
  }, [tournaments, filter, activeTypes]);

  const toggleType = (type: TournamentType) => {
    setActiveTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="pb-28">
      <Header title="Календарь" />
      <div className="px-4 space-y-4">
        <CalendarFilters
          filter={filter}
          onFilterChange={setFilter}
          activeTypes={activeTypes}
          onToggleType={toggleType}
        />

        {filtered.length === 0 ? (
          <div className="rounded-2xl bg-burgundy-800/60 border border-amber-900/20 p-8 text-center animate-fade-in">
            <CalendarX2 className="w-8 h-8 text-amber-400/40 mx-auto mb-3" />
            <div className="text-amber-200/60 text-sm">
              {filter === "upcoming"
                ? "Предстоящих турниров с такими фильтрами нет"
                : "Нет турниров для выбранного фильтра"}
            </div>
            {activeTypes.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTypes([])}
                className="mt-3 text-amber-300 text-sm underline-offset-4 hover:underline"
              >
                Сбросить фильтр по типу
              </button>
            )}
          </div>
        ) : (
          // key по фильтру перезапускает каскад входных анимаций при переключении
          <div key={`${filter}-${activeTypes.join(",")}`} className="space-y-4">
            {filtered.map((t, i) => (
              <div
                key={t.id}
                className="animate-rise-up"
                style={{ animationDelay: `${Math.min(i, 10) * 45}ms` }}
              >
                <div className="flex items-baseline gap-3 mb-2 px-1">
                  <span className="text-amber-300 font-bold">{t.day}</span>
                  <span className="text-amber-200/40 text-sm">{t.date}</span>
                </div>
                <Link href={`/tournament/${t.id}`} className="block">
                  <TournamentCard tournament={t} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
