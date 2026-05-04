import Link from "next/link";
import { Header } from "@/widgets/header";
import { CalendarFilters } from "@/features/filter-tournaments";
import { TournamentCard, type Tournament } from "@/entities/tournament";

export interface CalendarPageProps {
  tournaments: Tournament[];
}

export function CalendarPage({ tournaments }: CalendarPageProps) {
  return (
    <div className="pb-28">
      <Header title="Календарь" />
      <div className="px-4 space-y-4">
        <CalendarFilters />
        {tournaments.length === 0 ? (
          <div className="rounded-2xl bg-burgundy-800/60 border border-amber-900/20 p-6 text-center text-amber-200/50 text-sm">
            Нет турниров для выбранного фильтра
          </div>
        ) : (
          tournaments.map((t) => (
            <div key={t.id}>
              <div className="flex items-baseline gap-3 mb-2 px-1">
                <span className="text-amber-300 font-bold">{t.day}</span>
                <span className="text-amber-200/40 text-sm">{t.date}</span>
              </div>
              <Link href={`/tournament/${t.id}`} className="block">
                <TournamentCard tournament={t} />
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
