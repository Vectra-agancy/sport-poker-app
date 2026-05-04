import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RERAISE CLUB",
  description:
    "Покерный клуб: запись на турниры, рейтинг, достижения и приглашения друзей.",
  applicationName: "RERAISE CLUB",
};

export const viewport: Viewport = {
  themeColor: "#0f0608",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="min-h-screen text-white antialiased">
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
