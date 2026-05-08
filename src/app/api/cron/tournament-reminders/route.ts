import { NextResponse } from "next/server";
import { prisma } from "@/shared/api/prisma";
import { notifyUser } from "@/shared/api/notifications";

// Force dynamic — Next attempts to prerender this at build time otherwise,
// hitting the DB before the cron is invoked.
export const dynamic = "force-dynamic";

const CRON_SECRET = process.env.CRON_SECRET;

// Send reminder when the tournament is N hours out, ± WINDOW.
const REMIND_WINDOW_MS = 30 * 60 * 1000;

interface Tier {
  fieldName: "reminded24hAt" | "reminded1hAt";
  /** Hours before tournament start. */
  hoursBefore: number;
  subject: (name: string) => string;
  body: (name: string, when: string) => string;
}

const TIERS: Tier[] = [
  {
    fieldName: "reminded24hAt",
    hoursBefore: 24,
    subject: (n) => `Завтра турнир: ${n}`,
    body: (n, when) =>
      `Напоминаем — завтра турнир «${n}» (${when}). Не забудьте отменить запись, если не сможете прийти.`,
  },
  {
    fieldName: "reminded1hAt",
    hoursBefore: 1,
    subject: (n) => `Через час: ${n}`,
    body: (n, when) =>
      `Турнир «${n}» начинается через час (${when}). До встречи!`,
  },
];

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function formatWhen(date: Date): string {
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)} в ${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

export async function GET(req: Request) {
  // Vercel Cron sends `Authorization: Bearer <secret>`. In dev the route
  // is reachable without auth iff CRON_SECRET is unset, which is fine
  // because TELEGRAM_BOT_TOKEN/RESEND_API_KEY are also typically missing
  // and notifyUser becomes a console-log no-op.
  if (CRON_SECRET) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const now = Date.now();
  const sentByTier: Record<string, number> = {};

  for (const tier of TIERS) {
    const target = now + tier.hoursBefore * 60 * 60 * 1000;
    const startsAtFrom = new Date(target - REMIND_WINDOW_MS);
    const startsAtTo = new Date(target + REMIND_WINDOW_MS);

    const tournaments = await prisma.tournament.findMany({
      where: {
        status: "scheduled",
        startsAt: { gte: startsAtFrom, lte: startsAtTo },
        [tier.fieldName]: null,
      },
      select: {
        id: true,
        name: true,
        startsAt: true,
        registrations: {
          where: { status: "registered" },
          select: { userId: true },
        },
      },
    });

    let sentCount = 0;

    for (const t of tournaments) {
      // Atomic claim: only the first run that flips the column proceeds
      // to send. Subsequent runs see updateMany return count=0.
      const claim = await prisma.tournament.updateMany({
        where: { id: t.id, [tier.fieldName]: null },
        data: { [tier.fieldName]: new Date() },
      });
      if (claim.count === 0) continue;

      const when = formatWhen(t.startsAt);
      const userIds = t.registrations.map((r) => r.userId);
      // Sequential to keep load on Telegram/Resend modest; volumes are small.
      for (const userId of userIds) {
        await notifyUser(userId, {
          subject: tier.subject(t.name),
          body: tier.body(t.name, when),
        });
      }
      sentCount += userIds.length;
    }

    sentByTier[`${tier.hoursBefore}h`] = sentCount;
  }

  return NextResponse.json({ ok: true, sent: sentByTier });
}
