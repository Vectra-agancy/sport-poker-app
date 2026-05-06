import Link from "next/link";
import { prisma } from "@/shared/api/prisma";
import { TOURNAMENT_TYPES } from "@/entities/tournament";

const STATUS_BADGE: Record<string, string> = {
  scheduled: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  in_progress: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  finished: "bg-slate-500/20 text-slate-300 border-slate-500/40",
  cancelled: "bg-rose-500/20 text-rose-300 border-rose-500/40",
};

const STATUS_LABEL: Record<string, string> = {
  scheduled: "Запланирован",
  in_progress: "Идёт",
  finished: "Завершён",
  cancelled: "Отменён",
};

function formatDateTime(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(date.getDate())}.${pad(
    date.getMonth() + 1
  )}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default async function AdminDashboardPage() {
  const [
    usersCount,
    tournamentsCount,
    scheduledCount,
    finishedCount,
    recent,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.tournament.count(),
    prisma.tournament.count({ where: { status: "scheduled" } }),
    prisma.tournament.count({ where: { status: "finished" } }),
    prisma.tournament.findMany({
      orderBy: { startsAt: "desc" },
      take: 20,
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
        startsAt: true,
        maxSeats: true,
        _count: { select: { registrations: true } },
      },
    }),
  ]);

  const stats = [
    { label: "Игроков", value: usersCount },
    { label: "Турниров", value: tournamentsCount },
    { label: "Запланировано", value: scheduledCount },
    { label: "Завершено", value: finishedCount },
  ];

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl bg-burgundy-800/80 border border-amber-900/20 p-4"
          >
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-amber-200/60 mt-1 uppercase tracking-wider">
              {s.label}
            </div>
          </div>
        ))}
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-bold text-lg">Турниры</h2>
          <Link
            href="/admin/tournaments/new"
            className="text-sm text-amber-300 underline-offset-4 hover:underline"
          >
            + Создать
          </Link>
        </div>
        <div className="space-y-2">
          {recent.length === 0 && (
            <div className="rounded-xl border border-amber-900/20 bg-burgundy-800/40 p-4 text-amber-200/60 text-sm">
              Турниров ещё нет. Нажмите «Создать», чтобы добавить первый.
            </div>
          )}
          {recent.map((t) => {
            const typeMeta =
              TOURNAMENT_TYPES[t.type as keyof typeof TOURNAMENT_TYPES];
            return (
              <Link
                key={t.id}
                href={`/admin/tournaments/${t.id}/edit`}
                className="block rounded-xl bg-burgundy-800/80 border border-amber-900/20 p-3 hover:border-amber-600/40 transition"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-white font-medium truncate">
                      {t.name}
                    </div>
                    <div className="text-xs text-amber-200/60 mt-0.5">
                      {formatDateTime(t.startsAt)} ·{" "}
                      {typeMeta?.label ?? t.type} · {t._count.registrations}/
                      {t.maxSeats}
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-md border whitespace-nowrap ${
                      STATUS_BADGE[t.status] ?? STATUS_BADGE.scheduled
                    }`}
                  >
                    {STATUS_LABEL[t.status] ?? t.status}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
