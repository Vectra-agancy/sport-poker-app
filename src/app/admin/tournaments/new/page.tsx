import Link from "next/link";
import { prisma } from "@/shared/api/prisma";
import { TournamentForm } from "@/features/admin-tournament-crud";

export default async function NewTournamentPage() {
  const seasons = await prisma.season.findMany({
    select: { id: true, name: true },
    orderBy: { startDate: "desc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-white font-bold text-xl">Новый турнир</h1>
        <Link
          href="/admin/tournaments"
          className="text-sm text-amber-300 underline-offset-4 hover:underline"
        >
          ← К списку
        </Link>
      </div>
      <TournamentForm seasons={seasons} />
    </div>
  );
}
