import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/shared/api/prisma";
import {
  ResultsForm,
  type PlayerInput,
} from "@/features/admin-tournament-results";

interface PageProps {
  params: { id: string };
}

export default async function TournamentResultsPage({ params }: PageProps) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) notFound();

  const tournament = await prisma.tournament.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      type: true,
      maxSeats: true,
      status: true,
    },
  });
  if (!tournament) notFound();

  const [registrations, results] = await Promise.all([
    prisma.registration.findMany({
      where: {
        tournamentId: id,
        status: { not: "cancelled" },
      },
      include: { user: { select: { id: true, nickname: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.tournamentResult.findMany({
      where: { tournamentId: id },
      select: { userId: true, place: true, bountiesCount: true },
    }),
  ]);

  const resultByUserId = new Map(results.map((r) => [r.userId, r]));

  const players: PlayerInput[] = registrations
    .map((reg) => {
      const existing = resultByUserId.get(reg.user.id);
      return {
        userId: reg.user.id,
        nickname: reg.user.nickname,
        attended: existing
          ? true
          : reg.status === "attended",
        place: existing?.place ?? null,
        bounties: existing?.bountiesCount ?? 0,
      };
    })
    // Sort: attended-with-place first by place, then registered, then no-shows.
    .sort((a, b) => {
      const aPlace = a.attended && a.place ? a.place : Infinity;
      const bPlace = b.attended && b.place ? b.place : Infinity;
      if (aPlace !== bPlace) return aPlace - bPlace;
      return a.nickname.localeCompare(b.nickname);
    });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-white font-bold text-xl truncate">
          Результаты: {tournament.name}
        </h1>
        <Link
          href={`/admin/tournaments/${id}/edit`}
          className="text-sm text-amber-300 underline-offset-4 hover:underline whitespace-nowrap"
        >
          ← К турниру
        </Link>
      </div>
      <p className="text-amber-200/60 text-sm">
        Очки за место + {tournament.type === "bounty" ? "150" : "100"} за
        каждое баунти. После сохранения рейтинг пересчитывается автоматически.
      </p>
      <ResultsForm
        tournamentId={tournament.id}
        tournamentType={tournament.type}
        maxSeats={tournament.maxSeats}
        initialPlayers={players}
        isFinished={tournament.status === "finished"}
      />
    </div>
  );
}
