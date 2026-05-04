"use client";

import { useRouter } from "next/navigation";
import { Header } from "@/widgets/header";
import { CalendarFilters } from "@/features/filter-tournaments";
import { MOCK_TOURNAMENTS, TournamentCard } from "@/entities/tournament";

export function CalendarPage() {
  const router = useRouter();
  return (
    <div className="pb-28">
      <Header title="Календарь" />
      <div className="px-4 space-y-4">
        <CalendarFilters />
        {MOCK_TOURNAMENTS.map((t) => (
          <div key={t.id}>
            <div className="flex items-baseline gap-3 mb-2 px-1">
              <span className="text-amber-300 font-bold">{t.day}</span>
              <span className="text-amber-200/40 text-sm">{t.date}</span>
            </div>
            <TournamentCard
              tournament={t}
              onClick={() => router.push(`/tournament/${t.id}`)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
