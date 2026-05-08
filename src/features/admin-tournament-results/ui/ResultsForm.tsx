"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/shared/ui";
import { totalPoints } from "../lib/points";
import { submitTournamentResults } from "../api/actions";

export interface PlayerInput {
  userId: number;
  nickname: string;
  attended: boolean;
  place: number | null;
  bounties: number;
}

export interface ResultsFormProps {
  tournamentId: number;
  tournamentType: string;
  maxSeats: number;
  initialPlayers: PlayerInput[];
  isFinished: boolean;
}

export function ResultsForm({
  tournamentId,
  tournamentType,
  maxSeats,
  initialPlayers,
  isFinished,
}: ResultsFormProps) {
  const router = useRouter();
  const [rows, setRows] = useState<PlayerInput[]>(initialPlayers);
  const [markFinished, setMarkFinished] = useState(!isFinished);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const updateRow = (
    userId: number,
    patch: Partial<PlayerInput>
  ) => {
    setRows((rs) =>
      rs.map((r) => (r.userId === userId ? { ...r, ...patch } : r))
    );
  };

  const onSubmit = () => {
    setError(null);
    startTransition(async () => {
      const result = await submitTournamentResults(
        tournamentId,
        rows.map((r) => ({
          userId: r.userId,
          attended: r.attended,
          place: r.attended ? r.place : null,
          bounties: r.attended ? r.bounties : 0,
        })),
        { markFinished }
      );
      if (!result.ok) {
        setError(result.error ?? "Не удалось сохранить");
        return;
      }
      router.push(`/admin/tournaments/${tournamentId}/edit`);
      router.refresh();
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-4"
    >
      <div className="rounded-2xl bg-burgundy-800/80 border border-amber-900/20 overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-3 py-2 border-b border-amber-900/20 text-[10px] uppercase tracking-wider text-amber-200/60">
          <div className="col-span-5">Игрок</div>
          <div className="col-span-1 text-center">Был</div>
          <div className="col-span-2 text-center">Место</div>
          <div className="col-span-2 text-center">Баунти</div>
          <div className="col-span-2 text-right">Очки</div>
        </div>
        {rows.length === 0 && (
          <div className="px-3 py-6 text-amber-200/50 text-sm text-center">
            На турнир ещё никто не записался.
          </div>
        )}
        {rows.map((r) => {
          const pts =
            r.attended && r.place
              ? totalPoints(r.place, r.bounties, maxSeats, tournamentType)
              : 0;
          return (
            <div
              key={r.userId}
              className="grid grid-cols-12 gap-2 px-3 py-2 items-center border-b border-amber-900/10 last:border-b-0"
            >
              <div className="col-span-5 text-white truncate text-sm">
                {r.nickname}
              </div>
              <div className="col-span-1 flex justify-center">
                <input
                  type="checkbox"
                  checked={r.attended}
                  onChange={(e) =>
                    updateRow(r.userId, { attended: e.target.checked })
                  }
                  className="w-4 h-4 accent-amber-500"
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  min={1}
                  value={r.place ?? ""}
                  disabled={!r.attended}
                  onChange={(e) =>
                    updateRow(r.userId, {
                      place:
                        e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                  className="text-center h-9 px-2"
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  min={0}
                  value={r.bounties}
                  disabled={!r.attended}
                  onChange={(e) =>
                    updateRow(r.userId, {
                      bounties: Number(e.target.value || 0),
                    })
                  }
                  className="text-center h-9 px-2"
                />
              </div>
              <div className="col-span-2 text-right text-amber-300 font-bold text-sm">
                {pts}
              </div>
            </div>
          );
        })}
      </div>

      <label className="flex items-center gap-2 text-sm text-amber-100/80 cursor-pointer">
        <input
          type="checkbox"
          checked={markFinished}
          onChange={(e) => setMarkFinished(e.target.checked)}
          className="w-4 h-4 accent-amber-500"
        />
        Отметить турнир как завершённый
      </label>

      {error && (
        <div className="rounded-xl border border-rose-700/40 bg-rose-900/40 px-4 py-2 text-rose-100 text-sm">
          {error}
        </div>
      )}

      <Button type="submit" disabled={pending || rows.length === 0}>
        {pending ? "Сохранение…" : "Сохранить результаты"}
      </Button>
    </form>
  );
}
