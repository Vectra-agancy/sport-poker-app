import { prisma } from "@/shared/api/prisma";
import { toDateInputValue } from "@/shared/lib/format";
import { SeasonsManager, type SeasonItem } from "@/features/admin-season-crud";

export const dynamic = "force-dynamic";

export default async function AdminSeasonsPage() {
  const seasons = await prisma.season.findMany({
    orderBy: { startDate: "desc" },
    include: { _count: { select: { tournaments: true } } },
  });

  const items: SeasonItem[] = seasons.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    startDate: toDateInputValue(s.startDate),
    endDate: toDateInputValue(s.endDate),
    isActive: s.isActive,
    tournamentsCount: s._count.tournaments,
  }));

  return (
    <div className="space-y-4">
      <h1 className="text-white font-bold text-xl">Сезоны</h1>
      <p className="text-amber-200/60 text-sm">
        Активный сезон используется для сезонного рейтинга. Активным может
        быть только один сезон.
      </p>
      <SeasonsManager seasons={items} />
    </div>
  );
}
