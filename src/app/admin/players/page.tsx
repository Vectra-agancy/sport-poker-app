import Link from "next/link";
import { prisma } from "@/shared/api/prisma";
import { formatDate } from "@/shared/lib/format";
import { TIER_LABELS } from "@/entities/user";
import type { Tier } from "@/entities/user";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: { q?: string };
}

export default async function AdminPlayersPage({ searchParams }: PageProps) {
  const q = searchParams.q?.trim() || "";

  const [players, total] = await Promise.all([
    prisma.user.findMany({
      where: q
        ? {
            OR: [
              { nickname: { contains: q } },
              { email: { contains: q } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        nickname: true,
        email: true,
        telegramId: true,
        tier: true,
        isAdmin: true,
        freeTickets: true,
        createdAt: true,
        _count: {
          select: { registrations: true, tournamentResults: true },
        },
      },
    }),
    prisma.user.count(),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-white font-bold text-xl">Игроки</h1>
        <span className="text-sm text-amber-200/60">Всего: {total}</span>
      </div>

      <form method="GET" className="flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Поиск по нику или email…"
          className="w-full rounded-md border border-amber-900/30 bg-burgundy-900/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-600/40"
        />
        <button
          type="submit"
          className="rounded-md border border-amber-900/30 bg-burgundy-800/60 px-3 py-2 text-sm text-amber-200 hover:border-amber-600/40 transition whitespace-nowrap"
        >
          Найти
        </button>
      </form>

      <div className="space-y-2">
        {players.length === 0 && (
          <div className="rounded-xl border border-amber-900/20 bg-burgundy-800/40 p-4 text-amber-200/60 text-sm">
            Никого не нашли.
          </div>
        )}
        {players.map((p) => (
          <Link
            key={p.id}
            href={`/admin/players/${p.id}`}
            className="block rounded-xl bg-burgundy-800/80 border border-amber-900/20 p-3 hover:border-amber-600/40 transition"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-white font-medium truncate">
                    {p.nickname}
                  </span>
                  {p.isAdmin && (
                    <span className="text-[10px] uppercase px-1.5 py-0.5 rounded border border-amber-500/40 bg-amber-500/20 text-amber-200 whitespace-nowrap">
                      админ
                    </span>
                  )}
                </div>
                <div className="text-xs text-amber-200/60 mt-0.5 truncate">
                  {TIER_LABELS[p.tier as Tier] ?? p.tier}
                  {p.email ? ` · ${p.email}` : ""}
                  {p.telegramId ? " · TG" : ""}
                  {p.freeTickets > 0 ? ` · 🎟 ${p.freeTickets}` : ""}
                </div>
                <div className="text-xs text-amber-200/40 mt-0.5">
                  Регистраций: {p._count.registrations} · Результатов:{" "}
                  {p._count.tournamentResults} · с {formatDate(p.createdAt)}
                </div>
              </div>
              <span className="text-amber-300 text-sm">→</span>
            </div>
          </Link>
        ))}
      </div>
      {players.length === 100 && (
        <p className="text-xs text-amber-200/50">
          Показаны первые 100 — уточните поиск, чтобы найти остальных.
        </p>
      )}
    </div>
  );
}
