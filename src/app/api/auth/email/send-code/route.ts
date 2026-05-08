import { NextResponse } from "next/server";
import { prisma } from "@/shared/api/prisma";
import { sendOtpEmail } from "@/shared/api/resend";
import {
  OTP_TTL_MINUTES,
  generateOtpCode,
  hashOtpCode,
  otpExpiry,
} from "@/shared/lib/otp";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COOLDOWN_SECONDS = 60;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const email =
    body && typeof body === "object" && "email" in body
      ? String((body as { email: unknown }).email ?? "")
          .toLowerCase()
          .trim()
      : "";
  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  // Throttle: reject if a code was sent within cooldown window
  const recent = await prisma.verificationCode.findFirst({
    where: { email, usedAt: null },
    orderBy: { createdAt: "desc" },
  });
  if (recent) {
    const ageSeconds = Math.floor(
      (Date.now() - recent.createdAt.getTime()) / 1000
    );
    if (ageSeconds < COOLDOWN_SECONDS) {
      return NextResponse.json(
        { error: "rate_limited", retryAfter: COOLDOWN_SECONDS - ageSeconds },
        { status: 429 }
      );
    }
  }

  const code = generateOtpCode();
  await prisma.verificationCode.create({
    data: {
      email,
      codeHash: hashOtpCode(code, email),
      expiresAt: otpExpiry(),
    },
  });

  // No Resend key configured: short-circuit to dev-mode response so the UI
  // tells the user to grab the code from server logs, instead of a
  // misleading "Код отправлен на email".
  if (!process.env.RESEND_API_KEY) {
    console.warn(
      `[auth/email/send-code] RESEND_API_KEY missing — code for ${email}: ${code}`
    );
    return NextResponse.json({
      ok: true,
      ttlMinutes: OTP_TTL_MINUTES,
      devNote:
        "Resend не настроен; код напечатан в логах сервера",
    });
  }

  try {
    await sendOtpEmail({ to: email, code, ttlMinutes: OTP_TTL_MINUTES });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      // Keep dev unblocked when Resend rejects (e.g. unverified domain).
      console.warn(
        `[auth/email/send-code] Resend failed in dev — code for ${email}: ${code}`,
        err
      );
      return NextResponse.json({
        ok: true,
        ttlMinutes: OTP_TTL_MINUTES,
        devNote: "Resend failed; code printed in server logs",
      });
    }
    console.error("[auth/email/send-code] send failed", err);
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, ttlMinutes: OTP_TTL_MINUTES });
}
