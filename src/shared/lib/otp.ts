import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

export const OTP_LENGTH = 6;
export const OTP_TTL_MINUTES = 10;
export const OTP_MAX_ATTEMPTS = 5;

export function generateOtpCode(): string {
  // 6-digit zero-padded code
  return randomInt(0, 1_000_000).toString().padStart(OTP_LENGTH, "0");
}

function getPepper(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is required to hash OTP codes");
  }
  return secret;
}

export function hashOtpCode(code: string, email: string): string {
  // Bind hash to email so a leaked hash for one address can't be replayed elsewhere
  return createHmac("sha256", getPepper())
    .update(`${email.toLowerCase()}:${code}`)
    .digest("hex");
}

export function verifyOtpCode(
  code: string,
  email: string,
  hash: string
): boolean {
  const candidate = Buffer.from(hashOtpCode(code, email), "hex");
  const expected = Buffer.from(hash, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}

export function otpExpiry(): Date {
  return new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
}
