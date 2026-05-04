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

  try {
    await sendOtpEmail({ to: email, code, ttlMinutes: OTP_TTL_MINUTES });
  } catch (err) {
    console.error("[auth/email/send-code] send failed", err);
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, ttlMinutes: OTP_TTL_MINUTES });
}
