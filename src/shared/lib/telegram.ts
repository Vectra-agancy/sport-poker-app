import { createHmac, timingSafeEqual } from "node:crypto";

export interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface VerifiedTelegramInitData {
  user: TelegramUser;
  authDate: Date;
  queryId?: string;
  startParam?: string;
}

const MAX_AUTH_AGE_SECONDS = 24 * 60 * 60;

/**
 * Validates Telegram WebApp initData per
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-web-app
 */
export function verifyTelegramInitData(
  initData: string,
  botToken: string,
  options: { maxAgeSeconds?: number } = {}
): VerifiedTelegramInitData | null {
  if (!initData || !botToken) return null;

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;
  params.delete("hash");

  // data_check_string = key=value pairs sorted by key, joined by \n
  const dataCheckString = Array.from(params.entries())
    .map(([k, v]) => [k, v] as const)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");

  const secretKey = createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();
  const expectedHash = createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  // Constant-time comparison
  const expected = Buffer.from(expectedHash, "hex");
  const provided = Buffer.from(hash, "hex");
  if (
    expected.length !== provided.length ||
    !timingSafeEqual(expected, provided)
  ) {
    return null;
  }

  // Verify auth_date freshness
  const authDateRaw = params.get("auth_date");
  if (!authDateRaw) return null;
  const authDateUnix = Number(authDateRaw);
  if (!Number.isFinite(authDateUnix)) return null;

  const maxAge = options.maxAgeSeconds ?? MAX_AUTH_AGE_SECONDS;
  const ageSeconds = Math.floor(Date.now() / 1000) - authDateUnix;
  if (ageSeconds < 0 || ageSeconds > maxAge) return null;

  // Parse user JSON
  const userRaw = params.get("user");
  if (!userRaw) return null;
  let user: TelegramUser;
  try {
    user = JSON.parse(userRaw);
  } catch {
    return null;
  }
  if (!user || typeof user.id !== "number") return null;

  return {
    user,
    authDate: new Date(authDateUnix * 1000),
    queryId: params.get("query_id") ?? undefined,
    startParam: params.get("start_param") ?? undefined,
  };
}
