import { Resend } from "resend";

const globalForResend = globalThis as unknown as {
  resend: Resend | undefined;
};

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!globalForResend.resend) {
    globalForResend.resend = new Resend(apiKey);
  }
  return globalForResend.resend;
}

export interface SendOtpEmailOptions {
  to: string;
  code: string;
  ttlMinutes: number;
}

/**
 * Sends an OTP email via Resend. In dev (no RESEND_API_KEY) the code is logged
 * to the console so the flow stays usable without a real account.
 */
export async function sendOtpEmail({
  to,
  code,
  ttlMinutes,
}: SendOtpEmailOptions): Promise<void> {
  const resend = getResend();
  const from = process.env.EMAIL_FROM ?? "RERAISE CLUB <noreply@reraise.club>";

  if (!resend) {
    console.warn(
      `[auth/otp] RESEND_API_KEY missing. Code for ${to}: ${code} (valid ${ttlMinutes}m)`
    );
    return;
  }

  const html = `
    <div style="font-family:system-ui,-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#1a0a0c;color:#fde68a;border-radius:16px;">
      <h1 style="font-family:Georgia,serif;color:#fcd34d;margin:0 0 12px 0;">RERAISE CLUB</h1>
      <p style="margin:0 0 16px 0;">Ваш код для входа:</p>
      <div style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#fff;background:#2a1014;padding:16px;border-radius:12px;text-align:center;border:1px solid rgba(180,83,9,0.3);">
        ${code}
      </div>
      <p style="margin:16px 0 0 0;font-size:14px;color:rgba(253,230,138,0.6);">
        Код действует ${ttlMinutes} минут. Если вы не запрашивали вход — просто игнорируйте это письмо.
      </p>
    </div>
  `;

  const { error } = await resend.emails.send({
    from,
    to,
    subject: `Код для входа в RERAISE CLUB: ${code}`,
    html,
  });

  if (error) {
    throw new Error(`Resend failed: ${error.message ?? "unknown"}`);
  }
}
