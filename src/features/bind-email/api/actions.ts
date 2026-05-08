"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/shared/api/prisma";
import { getCurrentUser } from "@/shared/lib/auth-helpers";
import { OTP_MAX_ATTEMPTS, verifyOtpCode } from "@/shared/lib/otp";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface BindEmailResult {
  ok: boolean;
  error?: string;
}

/**
 * Verifies an OTP and attaches the email to the currently logged-in user.
 * Used by Telegram-first users who want to also be able to log in via email.
 */
export async function bindEmailToCurrentUser(input: {
  email: string;
  code: string;
}): Promise<BindEmailResult> {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return { ok: false, error: "Не авторизован" };
  const userId = Number(sessionUser.id);

  const email = input.email.toLowerCase().trim();
  const code = input.code.trim();
  if (!email || !EMAIL_REGEX.test(email)) {
    return { ok: false, error: "Неверный email" };
  }
  if (!/^\d+$/.test(code)) {
    return { ok: false, error: "Неверный код" };
  }

  const record = await prisma.verificationCode.findFirst({
    where: {
      email,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });
  if (!record) {
    return { ok: false, error: "Код не найден или просрочен" };
  }
  if (record.attempts >= OTP_MAX_ATTEMPTS) {
    await prisma.verificationCode.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });
    return { ok: false, error: "Слишком много попыток, запросите новый код" };
  }

  const okCode = verifyOtpCode(code, email, record.codeHash);
  if (!okCode) {
    await prisma.verificationCode.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    return { ok: false, error: "Неверный код" };
  }

  // Burn this and any other unused codes for the same email.
  await prisma.verificationCode.updateMany({
    where: { email, usedAt: null },
    data: { usedAt: new Date() },
  });

  // Refuse if another user already owns this email.
  const conflict = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (conflict && conflict.id !== userId) {
    return {
      ok: false,
      error: "Этот email уже привязан к другому аккаунту",
    };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { email, emailVerified: new Date() },
  });

  revalidatePath("/profile");
  return { ok: true };
}
