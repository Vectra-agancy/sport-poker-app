import "server-only";
import { prisma } from "@/shared/api/prisma";

/**
 * Re-evaluates auto-unlock achievements for a single user. Idempotent:
 * already-unlocked entries stay; achievements only ever go from locked
 * to unlocked, never the reverse, so re-running this after later edits
 * (e.g. result corrections) is safe.
 *
 * Auto codes wired here:
 *   first_win    — first 1st place
 *   champion_5   — 5+ wins
 *   regular      — 10+ attended tournaments
 *   veteran      — 50+ attended tournaments
 *   iron_man     — 10 consecutive attended (by tournament startsAt)
 *   season_sweep — attended every finished tournament of a season
 *
 * Manual codes (royal_flush, lightning, ...) are skipped — they're granted
 * by an admin and have isManual=true in the catalog.
 */
export async function recomputeUserAchievements(
  userId: number
): Promise<void> {
  const [wins, attended, catalog, attendedRegs, finishedTournaments] =
    await Promise.all([
      prisma.tournamentResult.count({ where: { userId, place: 1 } }),
      prisma.registration.count({
        where: { userId, status: "attended" },
      }),
      prisma.achievement.findMany({
        where: { isManual: false },
        select: { id: true, code: true },
      }),
      prisma.registration.findMany({
        where: { userId, status: "attended" },
        select: { tournamentId: true },
      }),
      prisma.tournament.findMany({
        where: { status: "finished" },
        select: { id: true, seasonId: true, startsAt: true },
        orderBy: { startsAt: "asc" },
      }),
    ]);

  const codeToId = new Map(catalog.map((a) => [a.code, a.id]));
  const attendedSet = new Set(attendedRegs.map((r) => r.tournamentId));

  const codesToUnlock: string[] = [];

  if (wins >= 1) codesToUnlock.push("first_win");
  if (wins >= 5) codesToUnlock.push("champion_5");
  if (attended >= 10) codesToUnlock.push("regular");
  if (attended >= 50) codesToUnlock.push("veteran");

  if (attended >= 10) {
    let run = 0;
    let maxRun = 0;
    for (const t of finishedTournaments) {
      if (attendedSet.has(t.id)) {
        run += 1;
        if (run > maxRun) maxRun = run;
      } else {
        run = 0;
      }
    }
    if (maxRun >= 10) codesToUnlock.push("iron_man");
  }

  // season_sweep: any season where user attended every finished tournament
  // (ignore seasons with zero finished tournaments).
  const bySeason = new Map<number, { total: number; attended: number }>();
  for (const t of finishedTournaments) {
    if (t.seasonId === null) continue;
    const cur = bySeason.get(t.seasonId) ?? { total: 0, attended: 0 };
    cur.total += 1;
    if (attendedSet.has(t.id)) cur.attended += 1;
    bySeason.set(t.seasonId, cur);
  }
  for (const [, agg] of bySeason) {
    if (agg.total > 0 && agg.attended === agg.total) {
      codesToUnlock.push("season_sweep");
      break;
    }
  }

  if (codesToUnlock.length === 0) return;

  await Promise.all(
    codesToUnlock
      .map((code) => codeToId.get(code))
      .filter((id): id is number => id !== undefined)
      .map((achievementId) =>
        prisma.userAchievement.upsert({
          where: {
            userId_achievementId: { userId, achievementId },
          },
          create: { userId, achievementId },
          update: {},
        })
      )
  );
}
