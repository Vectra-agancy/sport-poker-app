"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/shared/api/prisma";
import { getCurrentUser } from "@/shared/lib/auth-helpers";

const NICKNAME_REGEX = /^[\p{L}\p{N}_-]{3,20}$/u;

export interface ChangeNicknameResult {
  ok: boolean;
  nickname?: string;
  error?: string;
}

export async function changeNickname(
  raw: string
): Promise<ChangeNicknameResult> {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return { ok: false, error: "Не авторизован" };
  const userId = Number(sessionUser.id);

  const nickname = raw.trim();
  if (!nickname) return { ok: false, error: "Введите ник" };
  if (!NICKNAME_REGEX.test(nickname)) {
    return {
      ok: false,
      error:
        "Ник: 3–20 символов, только буквы, цифры, «_» и «-»",
    };
  }

  if (nickname === sessionUser.nickname) {
    return { ok: true, nickname };
  }

  const conflict = await prisma.user.findUnique({
    where: { nickname },
    select: { id: true },
  });
  if (conflict && conflict.id !== userId) {
    return { ok: false, error: "Этот ник уже занят" };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { nickname },
  });

  revalidatePath("/profile");
  revalidatePath("/rating");
  revalidatePath("/");
  return { ok: true, nickname };
}
