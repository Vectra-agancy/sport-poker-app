/**
 * Клиентский хелпер «поделиться»: внутри Telegram Mini App открывает нативный
 * шэр-лист, в браузере копирует текст в буфер. Возвращает, что произошло,
 * чтобы кнопка могла показать состояние «скопировано».
 */
export type ShareResult = "shared" | "copied" | "failed";

interface TelegramWebAppLike {
  openTelegramLink?: (url: string) => void;
}

function getTelegramWebApp(): TelegramWebAppLike | undefined {
  return (
    window as { Telegram?: { WebApp?: TelegramWebAppLike } }
  ).Telegram?.WebApp;
}

export async function shareLink(options: {
  url: string;
  text: string;
}): Promise<ShareResult> {
  const tg = getTelegramWebApp();
  if (tg?.openTelegramLink) {
    tg.openTelegramLink(
      `https://t.me/share/url?url=${encodeURIComponent(
        options.url
      )}&text=${encodeURIComponent(options.text)}`
    );
    return "shared";
  }

  const clipboardText = `${options.text}: ${options.url}`;
  try {
    await navigator.clipboard.writeText(clipboardText);
    return "copied";
  } catch {
    // Фолбэк для не-secure контекстов — временная textarea.
    const ta = document.createElement("textarea");
    ta.value = clipboardText;
    ta.style.position = "fixed";
    ta.style.left = "-1000px";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      return "copied";
    } catch {
      return "failed";
    } finally {
      document.body.removeChild(ta);
    }
  }
}
