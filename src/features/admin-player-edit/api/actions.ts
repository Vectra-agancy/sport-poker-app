"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/shared/api/prisma";
import { getCurrentUser } from "@/shared/lib/auth-helpers";
import { recomputeGlobalRating } from "@/entities/rating/server";

const TIERS = ["bronze", "silver", "gold", "platinum"] as const;

export interface PlayerFormValues {
  nickname: string;
  email: string | null;
  tier: string;
  isAdmin: boolean;
  freeTickets: number;
  notifyTelegram: boolean;
  notifyEmail: boolean;
}

export interface ActionResult {
  ok: boolean;
  error?: string;
}

async function ensureAdmin() {
  const user = await getCurrentUser();
  if (!user || !user.isAdmin) return null;
  return user;
}

function revalidatePlayer(id: number, nickname?: string) {
  revalidatePath("/admin/players");
  revalidatePath(`/admin/players/${id}`);
  revalidatePath("/rating");
  if (nickname) revalidatePath(`/u/${nickname}`);
}

export async function updatePlayer(
  id: number,
  values: PlayerFormValues
): Promise<ActionResult> {
  const admin = await ensureAdmin();
  if (!admin) return { ok: false, error: "Доступ запрещён" };

  const nickname = values.nickname.trim();
  if (nickname.length < 2 || nickname.length > 32) {
    return { ok: false, error: "Ник должен быть от 2 до 32 символов" };
  }
  if (!TIERS.includes(values.tier as (typeof TIERS)[number])) {
    return { ok: false, error: "Неверный тир" };
  }
  if (
    !Number.isInteger(values.freeTickets) ||
    values.freeTickets < 0 ||
    values.freeTickets > 999
  ) {
    return { ok: false, error: "Бесплатные билеты: целое число от 0 до 999" };
  }

  const email = values.email?.trim().toLowerCase() || null;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Неверный формат email" };
  }

  const existing = await prisma.user.findUnique({
    where: { id },
    select: { id: true, nickname: true, email: true },
  });
  if (!existing) return { ok: false, error: "Игрок не найден" };

  const [nickTaken, emailTaken] = await Promise.all([
    nickname !== existing.nickname
      ? prisma.user.findUnique({ where: { nickname }, select: { id: true } })
      : null,
    email && email !== existing.email
      ? prisma.user.findUnique({ where: { email }, select: { id: true } })
      : null,
  ]);
  if (nickTaken) return { ok: false, error: "Этот ник уже занят" };
  if (emailTaken) return { ok: false, error: "Этот email уже занят" };

  await prisma.user.update({
    where: { id },
    data: {
      nickname,
      email,
      // Сбрасываем метку верификации, если email убрали.
      ...(email === null ? { emailVerified: null } : {}),
      tier: values.tier,
      isAdmin: values.isAdmin,
      freeTickets: values.freeTickets,
      notifyTelegram: values.notifyTelegram,
      notifyEmail: values.notifyEmail,
    },
  });

  revalidatePlayer(id, existing.nickname);
  revalidatePlayer(id, nickname);
  return { ok: true };
}

export async function deletePlayer(id: number): Promise<ActionResult> {
  const admin = await ensureAdmin();
  if (!admin) return { ok: false, error: "Доступ запрещён" };
  if (Number(admin.id) === id) {
    return { ok: false, error: "Нельзя удалить самого себя" };
  }

  const existing = await prisma.user.findUnique({
    where: { id },
    select: { nickname: true, _count: { select: { tournamentResults: true } } },
  });
  if (!existing) return { ok: false, error: "Игрок не найден" };

  await prisma.user.delete({ where: { id } });

  // Каскад удалил результаты турниров — пересчитываем рейтинг.
  if (existing._count.tournamentResults > 0) {
    await recomputeGlobalRating();
  }

  revalidatePlayer(id, existing.nickname);
  return { ok: true };
}

export async function grantAchievement(
  userId: number,
  achievementId: number
): Promise<ActionResult> {
  const admin = await ensureAdmin();
  if (!admin) return { ok: false, error: "Доступ запрещён" };

  await prisma.userAchievement.upsert({
    where: { userId_achievementId: { userId, achievementId } },
    create: { userId, achievementId },
    update: {},
  });

  revalidatePlayer(userId);
  return { ok: true };
}

export async function revokeAchievement(
  userId: number,
  achievementId: number
): Promise<ActionResult> {
  const admin = await ensureAdmin();
  if (!admin) return { ok: false, error: "Доступ запрещён" };

  await prisma.userAchievement.deleteMany({
    where: { userId, achievementId },
  });

  revalidatePlayer(userId);
  return { ok: true };
}
