"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/shared/api/prisma";
import { getCurrentUser } from "@/shared/lib/auth-helpers";

export interface SeasonFormValues {
  name: string;
  slug: string;
  startDate: string; // yyyy-mm-dd
  endDate: string; // yyyy-mm-dd
  isActive: boolean;
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

function revalidateSeasons() {
  revalidatePath("/admin/seasons");
  revalidatePath("/rating");
  revalidatePath("/");
}

function validate(values: SeasonFormValues): string | null {
  if (!values.name?.trim()) return "Введите название сезона";
  if (!/^[a-z0-9-]{2,40}$/.test(values.slug)) {
    return "Slug: 2–40 символов, только a-z, 0-9 и дефис";
  }
  const start = new Date(values.startDate);
  const end = new Date(values.endDate);
  if (Number.isNaN(start.getTime())) return "Неверная дата начала";
  if (Number.isNaN(end.getTime())) return "Неверная дата окончания";
  if (end <= start) return "Дата окончания должна быть позже даты начала";
  return null;
}

async function slugTaken(slug: string, exceptId?: number) {
  const existing = await prisma.season.findUnique({
    where: { slug },
    select: { id: true },
  });
  return existing !== null && existing.id !== exceptId;
}

export async function createSeason(
  values: SeasonFormValues
): Promise<ActionResult> {
  const admin = await ensureAdmin();
  if (!admin) return { ok: false, error: "Доступ запрещён" };

  const err = validate(values);
  if (err) return { ok: false, error: err };
  if (await slugTaken(values.slug)) {
    return { ok: false, error: "Такой slug уже существует" };
  }

  const season = await prisma.$transaction(async (tx) => {
    if (values.isActive) {
      await tx.season.updateMany({ data: { isActive: false } });
    }
    return tx.season.create({
      data: {
        name: values.name.trim(),
        slug: values.slug,
        startDate: new Date(values.startDate),
        endDate: new Date(values.endDate),
        isActive: values.isActive,
      },
    });
  });

  revalidateSeasons();
  return { ok: true, id: season.id };
}

export async function updateSeason(
  id: number,
  values: SeasonFormValues
): Promise<ActionResult> {
  const admin = await ensureAdmin();
  if (!admin) return { ok: false, error: "Доступ запрещён" };

  const err = validate(values);
  if (err) return { ok: false, error: err };
  if (await slugTaken(values.slug, id)) {
    return { ok: false, error: "Такой slug уже существует" };
  }

  await prisma.$transaction(async (tx) => {
    if (values.isActive) {
      await tx.season.updateMany({
        where: { id: { not: id } },
        data: { isActive: false },
      });
    }
    await tx.season.update({
      where: { id },
      data: {
        name: values.name.trim(),
        slug: values.slug,
        startDate: new Date(values.startDate),
        endDate: new Date(values.endDate),
        isActive: values.isActive,
      },
    });
  });

  revalidateSeasons();
  return { ok: true, id };
}

export async function setActiveSeason(id: number): Promise<ActionResult> {
  const admin = await ensureAdmin();
  if (!admin) return { ok: false, error: "Доступ запрещён" };

  await prisma.$transaction([
    prisma.season.updateMany({ data: { isActive: false } }),
    prisma.season.update({ where: { id }, data: { isActive: true } }),
  ]);

  revalidateSeasons();
  return { ok: true, id };
}

export async function deleteSeason(id: number): Promise<ActionResult> {
  const admin = await ensureAdmin();
  if (!admin) return { ok: false, error: "Доступ запрещён" };

  // Турниры сезона не удаляются — у них просто отвяжется seasonId (SetNull).
  await prisma.season.delete({ where: { id } });

  revalidateSeasons();
  return { ok: true };
}
