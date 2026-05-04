"use client";

import { useState } from "react";
import { Input } from "@/shared/ui";

export function BindEmailForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="rounded-2xl bg-burgundy-800/80 border border-amber-900/20 p-5">
      <h3 className="text-white font-bold mb-2">Привязать email</h3>
      <p className="text-amber-100/60 text-sm mb-3">Чтобы входить через браузер</p>
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          type="button"
          onClick={() => {
            if (!email) return;
            setSent(true);
          }}
          className="px-4 py-3 rounded-xl bg-amber-700/60 border border-amber-600/40 text-white font-medium text-sm whitespace-nowrap active:scale-[0.98] transition"
        >
          {sent ? "Код отправлен" : "Получить код"}
        </button>
      </div>
    </div>
  );
}
