import Link from "next/link";
import { prisma } from "@/shared/api/prisma";
import { formatDateTime } from "@/shared/lib/format";
import { TOURNAMENT_TYPES, TOURNAMENT_STATUSES } from "@/entities/tournament";
import { TIER_LABELS } from "@/entities/user";
import type { Tier } from "@/entities/user";

export const dynamic = "force-dynamic";

const QUICK_ACTIONS = [
  { href: "/admin/tournaments/new", label: "+ Новый турнир" },
  { href: "/admin/tournaments", label: "Все турниры" },
  { href: "/admin/players", label: "Игроки" },
  { href: "/admin/seasons", label: "Сезоны" },
  { href: "/admin/achievements", label: "Достижения" },
];

export default async function AdminDashboardPage() {
  const [
    usersCount,
    tournamentsCount,
    scheduledCount,
    finishedCount,
    activeSeason,
    upcoming,
    latestPlayers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.tournament.count(),
    prisma.tournament.count({ where: { status: "scheduled" } }),
    prisma.tournament.count({ where: { status: "finished" } }),
    prisma.season.findFirst({
      where: { isActive: true },
      select: { id: true, name: true },
    }),
    prisma.tournament.findMany({
      where: { status: { in: ["scheduled", "in_progress"] } },
      orderBy: { startsAt: "asc" },
      take: 5,
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
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, nickname: true, tier: true, createdAt: true },
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

      <section className="rounded-xl bg-burgundy-800/80 border border-amber-900/20 p-4 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs text-amber-200/60 uppercase tracking-wider">
            Активный сезон
          </div>
          <div className="text-white font-medium mt-0.5">
            {activeSeason ? activeSeason.name : "Не задан"}
          </div>
        </div>
        <Link
          href="/admin/seasons"
          className="text-sm text-amber-300 underline-offset-4 hover:underline whitespace-nowrap"
        >
          Управлять →
        </Link>
      </section>

      <section className="flex flex-wrap gap-2">
        {QUICK_ACTIONS.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="rounded-lg border border-amber-900/30 bg-burgundy-800/60 px-3 py-2 text-sm text-amber-100/80 hover:text-amber-200 hover:border-amber-600/40 transition"
          >
            {a.label}
          </Link>
        ))}
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-bold text-lg">Ближайшие турниры</h2>
          <Link
            href="/admin/tournaments"
            className="text-sm text-amber-300 underline-offset-4 hover:underline"
          >
            Все →
          </Link>
        </div>
        <div className="space-y-2">
          {upcoming.length === 0 && (
            <div className="rounded-xl border border-amber-900/20 bg-burgundy-800/40 p-4 text-amber-200/60 text-sm">
              Нет запланированных турниров.{" "}
              <Link
                href="/admin/tournaments/new"
                className="text-amber-300 underline-offset-4 hover:underline"
              >
                Создать первый
              </Link>
            </div>
          )}
          {upcoming.map((t) => {
            const typeMeta =
              TOURNAMENT_TYPES[t.type as keyof typeof TOURNAMENT_TYPES];
            const statusMeta =
              TOURNAMENT_STATUSES[
                t.status as keyof typeof TOURNAMENT_STATUSES
              ] ?? TOURNAMENT_STATUSES.scheduled;
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
                      {formatDateTime(t.startsAt)} · {typeMeta?.label ?? t.type}{" "}
                      · {t._count.registrations}/{t.maxSeats}
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-md border whitespace-nowrap ${statusMeta.className}`}
                  >
                    {statusMeta.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-bold text-lg">Новые игроки</h2>
          <Link
            href="/admin/players"
            className="text-sm text-amber-300 underline-offset-4 hover:underline"
          >
            Все →
          </Link>
        </div>
        <div className="space-y-2">
          {latestPlayers.map((p) => (
            <Link
              key={p.id}
              href={`/admin/players/${p.id}`}
              className="flex items-center justify-between gap-3 rounded-xl bg-burgundy-800/80 border border-amber-900/20 p-3 hover:border-amber-600/40 transition"
            >
              <div className="min-w-0">
                <div className="text-white font-medium truncate">
                  {p.nickname}
                </div>
                <div className="text-xs text-amber-200/60 mt-0.5">
                  {TIER_LABELS[p.tier as Tier] ?? p.tier} · с{" "}
                  {formatDateTime(p.createdAt)}
                </div>
              </div>
              <span className="text-amber-300 text-sm">→</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
