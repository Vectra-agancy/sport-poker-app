import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/shared/api/prisma";
import { formatDateTime } from "@/shared/lib/format";
import {
  RegistrationsManager,
  type RegistrationItem,
} from "@/features/admin-registrations";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
}

export default async function TournamentRegistrationsPage({
  params,
}: PageProps) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) notFound();

  const tournament = await prisma.tournament.findUnique({
    where: { id },
    select: { id: true, name: true, maxSeats: true },
  });
  if (!tournament) notFound();

  const registrations = await prisma.registration.findMany({
    where: { tournamentId: id },
    include: { user: { select: { id: true, nickname: true } } },
    orderBy: { createdAt: "asc" },
  });

  const items: RegistrationItem[] = registrations.map((r) => ({
    id: r.id,
    status: r.status,
    usedFreeTicket: r.usedFreeTicket,
    createdAt: formatDateTime(r.createdAt),
    user: r.user,
  }));

  const activeCount = registrations.filter(
    (r) => r.status !== "cancelled"
  ).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-white font-bold text-xl truncate">
          Участники: {tournament.name}
        </h1>
        <div className="flex items-center gap-3 whitespace-nowrap text-sm">
          <Link
            href={`/admin/tournaments/${id}/edit`}
            className="text-amber-300 underline-offset-4 hover:underline"
          >
            Турнир
          </Link>
          <Link
            href={`/admin/tournaments/${id}/results`}
            className="text-amber-300 underline-offset-4 hover:underline"
          >
            Результаты
          </Link>
        </div>
      </div>
      <p className="text-amber-200/60 text-sm">
        Занято {activeCount} из {tournament.maxSeats} мест. Здесь можно
        добавить игрока вручную, поменять статус регистрации или удалить её.
      </p>
      <RegistrationsManager tournamentId={id} registrations={items} />
    </div>
  );
}
