import { redirect } from "next/navigation";
import { Header } from "@/widgets/header";
import { BindEmailForm } from "@/features/bind-email";
import { auth } from "@/shared/api/auth";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/profile");

  return (
    <div className="pb-12">
      <Header title="Вход" />
      <div className="px-4 space-y-4">
        <div className="rounded-2xl bg-gradient-to-br from-burgundy-700 to-burgundy-800 border border-amber-900/30 p-5">
          <h1 className="text-white font-bold text-xl mb-2">
            Войти в RERAISE CLUB
          </h1>
          <p className="text-amber-100/70 text-sm leading-relaxed">
            Откройте приложение через Telegram-бота — вход произойдёт
            автоматически. Либо подтвердите email одноразовым кодом.
          </p>
        </div>
        <BindEmailForm />
      </div>
    </div>
  );
}
