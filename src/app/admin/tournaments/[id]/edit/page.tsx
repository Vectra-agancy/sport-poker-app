import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/shared/api/prisma";
import {
  TournamentForm,
  type TournamentFormValues,
} from "@/features/admin-tournament-crud";
import type { TournamentType } from "@/entities/tournament";

interface PageProps {
  params: { id: string };
}

function toLocalDateTimeString(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default async function EditTournamentPage({ params }: PageProps) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) notFound();

  const [tournament, seasons] = await Promise.all([
    prisma.tournament.findUnique({
      where: { id },
      include: { levels: { orderBy: { level: "asc" } } },
    }),
    prisma.season.findMany({
      select: { id: true, name: true },
      orderBy: { startDate: "desc" },
    }),
  ]);

  if (!tournament) notFound();

  const initial: TournamentFormValues = {
    name: tournament.name,
    type: tournament.type as TournamentType,
    startsAt: toLocalDateTimeString(tournament.startsAt),
    location: tournament.location,
    maxSeats: tournament.maxSeats,
    startStack: tournament.startStack,
    ticketPrice: tournament.ticketPrice,
    guarantee: tournament.guarantee,
    format: tournament.format,
    seasonId: tournament.seasonId,
    levels: tournament.levels.map((l) => ({
      level: l.level,
      smallBlind: l.smallBlind,
      bigBlind: l.bigBlind,
      ante: l.ante,
      durationMin: l.durationMin,
      isBreak: l.isBreak,
    })),
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-white font-bold text-xl truncate">
          {tournament.name}
        </h1>
        <div className="flex items-center gap-3 whitespace-nowrap">
          <Link
            href={`/admin/tournaments/${tournament.id}/results`}
            className="text-sm text-amber-300 underline-offset-4 hover:underline"
          >
            Результаты →
          </Link>
          <Link
            href="/admin"
            className="text-sm text-amber-300 underline-offset-4 hover:underline"
          >
            ← К списку
          </Link>
        </div>
      </div>
      <TournamentForm
        seasons={seasons}
        tournamentId={tournament.id}
        initial={initial}
        initialStatus={tournament.status}
      />
    </div>
  );
}
