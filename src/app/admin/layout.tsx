import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/shared/lib/auth-helpers";
import { AdminNav } from "./admin-nav";

export const metadata: Metadata = {
  title: "Админка",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.isAdmin) redirect("/");

  return (
    <div className="min-h-screen pb-12">
      <header className="px-4 pt-6 pb-4 border-b border-amber-900/30">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-serif text-amber-200 text-lg tracking-widest">
              RERAISE ADMIN
            </div>
            <div className="text-xs text-amber-200/50 mt-0.5">
              {user.nickname}
            </div>
          </div>
          <Link
            href="/"
            className="text-xs text-amber-300 underline-offset-4 hover:underline"
          >
            К приложению →
          </Link>
        </div>
        <AdminNav />
      </header>
      <main className="px-4 pt-4">{children}</main>
    </div>
  );
}
