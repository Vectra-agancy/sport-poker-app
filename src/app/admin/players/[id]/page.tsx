import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/shared/api/prisma";
import { formatDateTime } from "@/shared/lib/format";
import {
  PlayerAchievements,
  PlayerEditForm,
  type AchievementToggleItem,
  type PlayerFormValues,
} from "@/features/admin-player-edit";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
}

export default async function AdminPlayerPage({ params }: PageProps) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) notFound();

  const [player, achievementCatalog] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      include: {
        achievements: { select: { achievementId: true } },
        registrations: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            tournament: { select: { id: true, name: true, startsAt: true } },
          },
        },
        tournamentResults: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            tournament: { select: { id: true, name: true } },
          },
        },
        _count: {
          select: {
            registrations: true,
            tournamentResults: true,
            referrals: true,
          },
        },
      },
    }),
    prisma.achievement.findMany({
      orderBy: [{ category: "asc" }, { title: "asc" }],
      select: { id: true, icon: true, title: true, isManual: true },
    }),
  ]);

  if (!player) notFound();

  const initial: PlayerFormValues = {
    nickname: player.nickname,
    email: player.email,
    tier: player.tier,
    isAdmin: player.isAdmin,
    freeTickets: player.freeTickets,
    notifyTelegram: player.notifyTelegram,
    notifyEmail: player.notifyEmail,
  };

  const unlockedIds = new Set(player.achievements.map((a) => a.achievementId));
  const achievements: AchievementToggleItem[] = achievementCatalog.map(
    (a) => ({ ...a, unlocked: unlockedIds.has(a.id) })
  );

  const totalPoints = await prisma.tournamentResult.aggregate({
    where: { userId: id },
    _sum: { pointsAwarded: true },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-white font-bold text-xl truncate">
          {player.nickname}
        </h1>
        <div className="flex items-center gap-3 whitespace-nowrap text-sm">
          <Link
            href={`/u/${player.nickname}`}
            className="text-amber-300 underline-offset-4 hover:underline"
          >
            Публичный профиль
          </Link>
          <Link
            href="/admin/players"
            className="text-amber-300 underline-offset-4 hover:underline"
          >
            ← К списку
          </Link>
        </div>
      </div>

      <section className="grid grid-cols-2 gap-3">
        {[
          { label: "Очков", value: totalPoints._sum.pointsAwarded ?? 0 },
          { label: "Регистраций", value: player._count.registrations },
          { label: "Результатов", value: player._count.tournamentResults },
          { label: "Приглашено", value: player._count.referrals },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl bg-burgundy-800/80 border border-amber-900/20 p-3"
          >
            <div className="text-xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-amber-200/60 mt-0.5 uppercase tracking-wider">
              {s.label}
            </div>
          </div>
        ))}
      </section>

      <div className="text-xs text-amber-200/50">
        ID {player.id}
        {player.telegramId ? ` · Telegram привязан` : " · Telegram не привязан"}
        {" · "}реф. код {player.referralCode}
        {" · "}в клубе с {formatDateTime(player.createdAt)}
      </div>

      <PlayerEditForm
        playerId={player.id}
        initial={initial}
        hasTelegram={Boolean(player.telegramId)}
      />

      <PlayerAchievements playerId={player.id} achievements={achievements} />

      <section className="rounded-2xl bg-burgundy-800/80 border border-amber-900/20 p-4 space-y-3">
        <h3 className="text-white font-bold text-sm uppercase tracking-wider">
          Последние результаты
        </h3>
        {player.tournamentResults.length === 0 && (
          <p className="text-sm text-amber-200/60">Результатов пока нет.</p>
        )}
        {player.tournamentResults.map((r) => (
          <Link
            key={r.id}
            href={`/admin/tournaments/${r.tournament.id}/results`}
            className="flex items-center justify-between gap-3 text-sm hover:text-amber-200 transition"
          >
            <span className="text-white truncate">{r.tournament.name}</span>
            <span className="text-amber-200/60 whitespace-nowrap">
              {r.place} место · {r.pointsAwarded} очк.
              {r.bountiesCount > 0 ? ` · ${r.bountiesCount} баунти` : ""}
            </span>
          </Link>
        ))}
      </section>

      <section className="rounded-2xl bg-burgundy-800/80 border border-amber-900/20 p-4 space-y-3">
        <h3 className="text-white font-bold text-sm uppercase tracking-wider">
          Последние регистрации
        </h3>
        {player.registrations.length === 0 && (
          <p className="text-sm text-amber-200/60">Регистраций пока нет.</p>
        )}
        {player.registrations.map((r) => (
          <Link
            key={r.id}
            href={`/admin/tournaments/${r.tournament.id}/registrations`}
            className="flex items-center justify-between gap-3 text-sm hover:text-amber-200 transition"
          >
            <span className="text-white truncate">{r.tournament.name}</span>
            <span className="text-amber-200/60 whitespace-nowrap">
              {formatDateTime(r.tournament.startsAt)} · {r.status}
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
