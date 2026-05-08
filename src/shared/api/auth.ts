import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { verifyTelegramInitData } from "@/shared/lib/telegram";
import { OTP_MAX_ATTEMPTS, verifyOtpCode } from "@/shared/lib/otp";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const REFERRAL_COOKIE = "ref_code";

function generateReferralCode(seed: string): string {
  // 6 char base36 hash from seed + random
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${seed.slice(0, 2).toUpperCase()}${random}`;
}

/**
 * Reads the ref_code cookie set by /r/[code] and links the brand-new user
 * to the referrer. No-op if cookie is missing, code is unknown, or it
 * matches the user themselves. The cookie is cleared after use.
 */
async function applyReferral(newUserId: number): Promise<void> {
  let store: Awaited<ReturnType<typeof cookies>> | null = null;
  try {
    store = await cookies();
  } catch {
    return;
  }
  const code = store.get(REFERRAL_COOKIE)?.value?.trim();
  if (!code) return;

  const referrer = await prisma.user.findUnique({
    where: { referralCode: code },
    select: { id: true },
  });
  if (!referrer || referrer.id === newUserId) {
    try {
      store.delete(REFERRAL_COOKIE);
    } catch {
      // Cookie store is read-only in some Next contexts; safe to ignore.
    }
    return;
  }

  await prisma.user.update({
    where: { id: newUserId },
    data: { referredById: referrer.id },
  });
  await prisma.referralProgress.upsert({
    where: { refereeId: newUserId },
    create: {
      referrerId: referrer.id,
      refereeId: newUserId,
    },
    update: {},
  });

  try {
    store.delete(REFERRAL_COOKIE);
  } catch {
    // ignore — see above
  }
}

async function upsertTelegramUser(payload: {
  telegramId: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
}) {
  const existing = await prisma.user.findUnique({
    where: { telegramId: payload.telegramId },
  });
  if (existing) return existing;

  // Build a unique nickname
  const baseNick =
    payload.username ||
    [payload.firstName, payload.lastName].filter(Boolean).join("_") ||
    `tg_${payload.telegramId.slice(-6)}`;

  let nickname = baseNick;
  let attempt = 0;
  while (
    await prisma.user.findUnique({ where: { nickname } }).then((u) => Boolean(u))
  ) {
    attempt += 1;
    nickname = `${baseNick}_${attempt}`;
    if (attempt > 50) {
      nickname = `${baseNick}_${Date.now()}`;
      break;
    }
  }

  const created = await prisma.user.create({
    data: {
      telegramId: payload.telegramId,
      nickname,
      avatarUrl: payload.photoUrl,
      referralCode: generateReferralCode(payload.telegramId),
    },
  });
  await applyReferral(created.id);
  return created;
}

async function upsertEmailUser(email: string) {
  const normalized = email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({
    where: { email: normalized },
  });
  if (existing) return existing;

  const baseNick = normalized.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_");
  let nickname = baseNick;
  let attempt = 0;
  while (
    await prisma.user.findUnique({ where: { nickname } }).then((u) => Boolean(u))
  ) {
    attempt += 1;
    nickname = `${baseNick}_${attempt}`;
    if (attempt > 50) {
      nickname = `${baseNick}_${Date.now()}`;
      break;
    }
  }

  const created = await prisma.user.create({
    data: {
      email: normalized,
      emailVerified: new Date(),
      nickname,
      referralCode: generateReferralCode(baseNick || "user"),
    },
  });
  await applyReferral(created.id);
  return created;
}

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [
    // ─── Telegram InitData ──────────────────────────────
    Credentials({
      id: "telegram",
      name: "Telegram",
      credentials: {
        initData: { type: "text" },
      },
      async authorize(credentials) {
        const initData =
          typeof credentials?.initData === "string" ? credentials.initData : "";
        if (!initData) return null;
        if (!TELEGRAM_BOT_TOKEN) {
          console.error(
            "[auth/telegram] TELEGRAM_BOT_TOKEN is not set; rejecting login"
          );
          return null;
        }
        const verified = verifyTelegramInitData(initData, TELEGRAM_BOT_TOKEN);
        if (!verified) return null;

        const user = await upsertTelegramUser({
          telegramId: String(verified.user.id),
          firstName: verified.user.first_name,
          lastName: verified.user.last_name,
          username: verified.user.username,
          photoUrl: verified.user.photo_url,
        });

        return {
          id: String(user.id),
          name: user.nickname,
          email: user.email ?? undefined,
          image: user.avatarUrl ?? undefined,
        };
      },
    }),

    // ─── Email OTP (verify step) ────────────────────────
    Credentials({
      id: "email-otp",
      name: "Email OTP",
      credentials: {
        email: { type: "email" },
        code: { type: "text" },
      },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string"
            ? credentials.email.toLowerCase().trim()
            : "";
        const code =
          typeof credentials?.code === "string" ? credentials.code.trim() : "";
        if (!email || !/^\d+$/.test(code)) return null;

        // Take the latest unused, non-expired code
        const record = await prisma.verificationCode.findFirst({
          where: {
            email,
            usedAt: null,
            expiresAt: { gt: new Date() },
          },
          orderBy: { createdAt: "desc" },
        });
        if (!record) return null;

        if (record.attempts >= OTP_MAX_ATTEMPTS) {
          // Burn the record so it can't be retried
          await prisma.verificationCode.update({
            where: { id: record.id },
            data: { usedAt: new Date() },
          });
          return null;
        }

        const ok = verifyOtpCode(code, email, record.codeHash);
        if (!ok) {
          await prisma.verificationCode.update({
            where: { id: record.id },
            data: { attempts: { increment: 1 } },
          });
          return null;
        }

        // Burn the code and any earlier ones for this email
        await prisma.verificationCode.updateMany({
          where: { email, usedAt: null },
          data: { usedAt: new Date() },
        });

        const user = await upsertEmailUser(email);

        return {
          id: String(user.id),
          name: user.nickname,
          email: user.email ?? undefined,
          image: user.avatarUrl ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.userId = Number(user.id);
        token.nickname = user.name ?? undefined;
        token.lastSync = 0;
      }
      // Refresh user profile from DB at most every 60s, or on explicit update
      // (e.g. after nickname change). Avoids a Prisma roundtrip on every server
      // navigation, which makes Mini App feel sluggish.
      const REFRESH_INTERVAL_MS = 60_000;
      const now = Date.now();
      const lastSync = (token.lastSync as number | undefined) ?? 0;
      const shouldRefresh =
        trigger === "update" || now - lastSync > REFRESH_INTERVAL_MS;
      if (typeof token.userId === "number" && shouldRefresh) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.userId },
          select: {
            nickname: true,
            tier: true,
            avatarUrl: true,
            isAdmin: true,
            email: true,
          },
        });
        if (dbUser) {
          token.nickname = dbUser.nickname;
          token.tier = dbUser.tier;
          token.avatarUrl = dbUser.avatarUrl;
          token.isAdmin = dbUser.isAdmin;
          token.userEmail = dbUser.email ?? null;
          token.lastSync = now;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (typeof token.userId === "number") {
        // Auth.js v5 types this callback with an AdapterUser intersection even
        // under JWT strategy; cast keeps our nullable fields honest.
        session.user = {
          ...session.user,
          id: String(token.userId),
          nickname: token.nickname ?? session.user.name ?? "",
          tier: token.tier ?? "bronze",
          avatarUrl: token.avatarUrl ?? null,
          isAdmin: Boolean(token.isAdmin),
          email: token.userEmail ?? null,
        } as typeof session.user;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
