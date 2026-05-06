"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Button,
  Input,
} from "@/shared/ui";
import { changeNickname } from "../api/actions";

export interface ChangeNicknameDialogProps {
  currentNickname: string;
}

export function ChangeNicknameDialog({
  currentNickname,
}: ChangeNicknameDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(currentNickname);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setValue(currentNickname);
      setError(null);
    }
  };

  const onSave = () => {
    setError(null);
    startTransition(async () => {
      const result = await changeNickname(value);
      if (!result.ok) {
        setError(result.error ?? "Не удалось изменить ник");
        return;
      }
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="Изменить ник"
          className="text-amber-300/80 hover:text-amber-200 active:scale-95 transition"
        >
          <Pencil className="w-4 h-4" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Сменить ник</DialogTitle>
          <DialogDescription>
            3–20 символов: буквы, цифры, «_» и «-».
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave();
          }}
          className="space-y-3"
        >
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
            maxLength={32}
            disabled={pending}
            placeholder="Например, V_Player"
          />
          {error && (
            <div className="rounded-md border border-rose-700/40 bg-rose-900/40 px-3 py-2 text-rose-100 text-xs">
              {error}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Сохранение…" : "Сохранить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
