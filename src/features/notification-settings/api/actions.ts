"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/shared/api/prisma";
import { getCurrentUser } from "@/shared/lib/auth-helpers";

export interface UpdateNotificationsInput {
  notifyTelegram?: boolean;
  notifyEmail?: boolean;
}

export interface UpdateNotificationsResult {
  ok: boolean;
  error?: string;
}

export async function updateNotificationSettings(
  input: UpdateNotificationsInput
): Promise<UpdateNotificationsResult> {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return { ok: false, error: "Не авторизован" };
  const userId = Number(sessionUser.id);

  // Build a partial patch — only include keys actually supplied.
  const data: { notifyTelegram?: boolean; notifyEmail?: boolean } = {};
  if (typeof input.notifyTelegram === "boolean") {
    data.notifyTelegram = input.notifyTelegram;
  }
  if (typeof input.notifyEmail === "boolean") {
    data.notifyEmail = input.notifyEmail;
  }
  if (Object.keys(data).length === 0) return { ok: true };

  await prisma.user.update({ where: { id: userId }, data });

  revalidatePath("/profile");
  return { ok: true };
}
