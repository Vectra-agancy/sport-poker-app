"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/shared/api/prisma";
import { getCurrentUser } from "@/shared/lib/auth-helpers";

const CATEGORIES = ["rare", "result", "participation"] as const;

export interface AchievementFormValues {
  code: string;
  icon: string;
  title: string;
  description: string;
  category: string;
  isManual: boolean;
}

export interface ActionResult {
  ok: boolean;
  id?: number;
  error?: string;
}

async function ensureAdmin() {
  const user = await getCurrentUser();
  if (!user || !user.isAdmin) return null;
  return user;
}

function revalidateAchievements() {
  revalidatePath("/admin/achievements");
  revalidatePath("/profile");
}

function validate(values: AchievementFormValues): string | null {
  if (!/^[a-z0-9_]{2,40}$/.test(values.code)) {
    return "Код: 2–40 символов, только a-z, 0-9 и подчёркивание";
  }
  if (!values.icon?.trim()) return "Укажите иконку (эмодзи)";
  if (!values.title?.trim()) return "Введите название";
  if (!values.description?.trim()) return "Введите описание";
  if (!CATEGORIES.includes(values.category as (typeof CATEGORIES)[number])) {
    return "Неверная категория";
  }
  return null;
}

async function codeTaken(code: string, exceptId?: number) {
  const existing = await prisma.achievement.findUnique({
    where: { code },
    select: { id: true },
  });
  return existing !== null && existing.id !== exceptId;
}

export async function createAchievement(
  values: AchievementFormValues
): Promise<ActionResult> {
  const admin = await ensureAdmin();
  if (!admin) return { ok: false, error: "Доступ запрещён" };

  const err = validate(values);
  if (err) return { ok: false, error: err };
  if (await codeTaken(values.code)) {
    return { ok: false, error: "Такой код уже существует" };
  }

  const achievement = await prisma.achievement.create({
    data: {
      code: values.code,
      icon: values.icon.trim(),
      title: values.title.trim(),
      description: values.description.trim(),
      category: values.category,
      isManual: values.isManual,
    },
  });

  revalidateAchievements();
  return { ok: true, id: achievement.id };
}

export async function updateAchievement(
  id: number,
  values: AchievementFormValues
): Promise<ActionResult> {
  const admin = await ensureAdmin();
  if (!admin) return { ok: false, error: "Доступ запрещён" };

  const err = validate(values);
  if (err) return { ok: false, error: err };
  if (await codeTaken(values.code, id)) {
    return { ok: false, error: "Такой код уже существует" };
  }

  await prisma.achievement.update({
    where: { id },
    data: {
      code: values.code,
      icon: values.icon.trim(),
      title: values.title.trim(),
      description: values.description.trim(),
      category: values.category,
      isManual: values.isManual,
    },
  });

  revalidateAchievements();
  return { ok: true, id };
}

export async function deleteAchievement(id: number): Promise<ActionResult> {
  const admin = await ensureAdmin();
  if (!admin) return { ok: false, error: "Доступ запрещён" };

  // Каскад удалит и все выдачи этого достижения игрокам.
  await prisma.achievement.delete({ where: { id } });

  revalidateAchievements();
  return { ok: true };
}
