import "server-only";
import { prisma } from "./prisma";
import { sendUserEmail } from "./resend";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function sendTelegramText(
  chatId: string,
  text: string
): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn(
      `[notifications] TELEGRAM_BOT_TOKEN missing — would send to ${chatId}: ${text}`
    );
    return false;
  }
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      }
    );
    if (!res.ok) {
      console.warn(
        `[notifications] telegram failed ${res.status} for ${chatId}`
      );
      return false;
    }
    return true;
  } catch (err) {
    console.warn(`[notifications] telegram error for ${chatId}`, err);
    return false;
  }
}

export interface NotifyOptions {
  /**
   * Short title — used as Telegram bold prefix and email subject.
   */
  subject: string;
  /**
   * Plain-text body.
   */
  body: string;
}

/**
 * Sends `subject + body` to a single user via every channel they've opted
 * into and have a destination for. Failures on any channel are logged
 * but never thrown — this is fire-and-forget.
 */
export async function notifyUser(
  userId: number,
  { subject, body }: NotifyOptions
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      telegramId: true,
      email: true,
      notifyTelegram: true,
      notifyEmail: true,
    },
  });
  if (!user) return;

  const tasks: Promise<unknown>[] = [];

  if (user.notifyTelegram && user.telegramId) {
    const text = `<b>${escapeHtml(subject)}</b>\n${escapeHtml(body)}`;
    tasks.push(sendTelegramText(user.telegramId, text));
  }

  if (user.notifyEmail && user.email) {
    tasks.push(
      sendUserEmail({ to: user.email, subject, body }).catch((err) => {
        console.warn(`[notifications] email error for user ${userId}`, err);
      })
    );
  }

  if (tasks.length === 0) return;
  await Promise.allSettled(tasks);
}
