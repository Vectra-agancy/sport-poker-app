import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { auth } from "@/shared/api/auth";
import { TelegramAuthBridge } from "@/widgets/telegram-auth-bridge";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://reraise.club";
const SITE_NAME = "RERAISE CLUB";
const SITE_DESCRIPTION =
  "Покерный клуб: запись на турниры, рейтинг, достижения и приглашения друзей.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: ["покер", "клуб", "турниры", "рейтинг", "RERAISE"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: "ru_RU",
  },
  twitter: {
    card: "summary",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f0608",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const isAuthenticated = Boolean(session?.user);

  return (
    <html lang="ru">
      <body className="min-h-screen text-white antialiased">
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
        <TelegramAuthBridge isAuthenticated={isAuthenticated} />
        <div
          className="fixed inset-0 -z-20"
          style={{
            background:
              "linear-gradient(180deg, #1a0a0c 0%, #0f0608 50%, #1a0a0c 100%)",
          }}
        />
        <div className="fixed inset-0 -z-10 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-amber-700/10 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-rose-900/20 blur-3xl" />
        </div>
        <div className="relative max-w-md mx-auto min-h-screen">{children}</div>
      </body>
    </html>
  );
}
