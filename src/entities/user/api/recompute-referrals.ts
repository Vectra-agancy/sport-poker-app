import "server-only";
import { prisma } from "@/shared/api/prisma";

const GAMES_PER_TICKET = 10;

/**
 * Re-syncs the referee's attendance counter and grants free tickets to
 * the referrer when crossing every {@link GAMES_PER_TICKET}-th attended
 * tournament. Idempotent: the snapshot of `ticketsAwarded` only ever
 * grows, so re-running after edits never claws back tickets that may
 * already have been spent.
 *
 * No-op for users without a referrer.
 */
export async function recomputeReferralProgress(
  refereeId: number
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: refereeId },
    select: { referredById: true },
  });
  if (!user?.referredById) return;
  const referrerId = user.referredById;

  const attendedCount = await prisma.registration.count({
    where: { userId: refereeId, status: "attended" },
  });
  const targetTickets = Math.floor(attendedCount / GAMES_PER_TICKET);

  const progress = await prisma.referralProgress.findUnique({
    where: { refereeId },
  });

  if (!progress) {
    await prisma.referralProgress.create({
      data: {
        referrerId,
        refereeId,
        attendedTournaments: attendedCount,
        ticketsAwarded: targetTickets,
      },
    });
    if (targetTickets > 0) {
      await prisma.user.update({
        where: { id: referrerId },
        data: { freeTickets: { increment: targetTickets } },
      });
    }
    return;
  }

  const ticketsToAward = Math.max(
    0,
    targetTickets - progress.ticketsAwarded
  );
  // Counter only ever grows: protects against state regressions if results
  // are later corrected and attendedCount drops.
  const nextAwarded = Math.max(progress.ticketsAwarded, targetTickets);

  await prisma.$transaction([
    prisma.referralProgress.update({
      where: { id: progress.id },
      data: {
        attendedTournaments: attendedCount,
        ticketsAwarded: nextAwarded,
      },
    }),
    ...(ticketsToAward > 0
      ? [
          prisma.user.update({
            where: { id: referrerId },
            data: { freeTickets: { increment: ticketsToAward } },
          }),
        ]
      : []),
  ]);
}
