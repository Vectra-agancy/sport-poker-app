import Link from "next/link";
import { prisma } from "@/shared/api/prisma";
import { formatDateTime } from "@/shared/lib/format";
import { TOURNAMENT_TYPES, TOURNAMENT_STATUSES } from "@/entities/tournament";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: { status?: string; q?: string };
}

const FILTERS: { value: string; label: string }[] = [
  { value: "", label: "Все" },
  { value: "scheduled", label: "Запланированы" },
  { value: "in_progress", label: "Идут" },
  { value: "finished", label: "Завершены" },
  { value: "cancelled", label: "Отменены" },
];

export default async function AdminTournamentsPage({
  searchParams,
}: PageProps) {
  const status = searchParams.status?.trim() || "";
  const q = searchParams.q?.trim() || "";

  const tournaments = await prisma.tournament.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(q ? { name: { contains: q } } : {}),
    },
    orderBy: { startsAt: "desc" },
    take: 100,
    select: {
      id: true,
      name: true,
      type: true,
      status: true,
      startsAt: true,
      maxSeats: true,
      season: { select: { name: true } },
      _count: { select: { registrations: true, results: true } },
    },
  });

  const filterHref = (value: string) => {
    const params = new URLSearchParams();
    if (value) params.set("status", value);
    if (q) params.set("q", q);
    const query = params.toString();
    return query ? `/admin/tournaments?${query}` : "/admin/tournaments";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-white font-bold text-xl">Турниры</h1>
        <Link
          href="/admin/tournaments/new"
          className="text-sm text-amber-300 underline-offset-4 hover:underline whitespace-nowrap"
        >
          + Создать
        </Link>
      </div>

      <form method="GET" className="flex gap-2">
        {status && <input type="hidden" name="status" value={status} />}
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Поиск по названию…"
          className="w-full rounded-md border border-amber-900/30 bg-burgundy-900/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-600/40"
        />
        <button
          type="submit"
          className="rounded-md border border-amber-900/30 bg-burgundy-800/60 px-3 py-2 text-sm text-amber-200 hover:border-amber-600/40 transition whitespace-nowrap"
        >
          Найти
        </button>
      </form>

      <div className="-mx-4 px-4 flex gap-2 overflow-x-auto scrollbar-none">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={filterHref(f.value)}
            className={`whitespace-nowrap rounded-lg px-3 py-1 text-xs border transition ${
              status === f.value
                ? "bg-amber-500/20 border-amber-500/40 text-amber-200"
                : "border-amber-900/20 text-amber-100/70 hover:text-amber-200"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="space-y-2">
        {tournaments.length === 0 && (
          <div className="rounded-xl border border-amber-900/20 bg-burgundy-800/40 p-4 text-amber-200/60 text-sm">
            Ничего не найдено.
          </div>
        )}
        {tournaments.map((t) => {
          const typeMeta =
            TOURNAMENT_TYPES[t.type as keyof typeof TOURNAMENT_TYPES];
          const statusMeta =
            TOURNAMENT_STATUSES[t.status as keyof typeof TOURNAMENT_STATUSES] ??
            TOURNAMENT_STATUSES.scheduled;
          return (
            <div
              key={t.id}
              className="rounded-xl bg-burgundy-800/80 border border-amber-900/20 p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/admin/tournaments/${t.id}/edit`}
                    className="text-white font-medium truncate block hover:text-amber-200 transition"
                  >
                    {t.name}
                  </Link>
                  <div className="text-xs text-amber-200/60 mt-0.5">
                    {formatDateTime(t.startsAt)} · {typeMeta?.label ?? t.type}
                    {t.season ? ` · ${t.season.name}` : ""} ·{" "}
                    {t._count.registrations}/{t.maxSeats}
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-md border whitespace-nowrap ${statusMeta.className}`}
                >
                  {statusMeta.label}
                </span>
              </div>
              <div className="mt-2 flex gap-4 text-xs">
                <Link
                  href={`/admin/tournaments/${t.id}/edit`}
                  className="text-amber-300 underline-offset-4 hover:underline"
                >
                  Редактировать
                </Link>
                <Link
                  href={`/admin/tournaments/${t.id}/registrations`}
                  className="text-amber-300 underline-offset-4 hover:underline"
                >
                  Участники ({t._count.registrations})
                </Link>
                <Link
                  href={`/admin/tournaments/${t.id}/results`}
                  className="text-amber-300 underline-offset-4 hover:underline"
                >
                  Результаты{t._count.results > 0 ? " ✓" : ""}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
