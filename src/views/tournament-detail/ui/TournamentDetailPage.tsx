"use client";

import { useState } from "react";
import { ChevronDown, Flame, Layers, Share2 } from "lucide-react";
import { Header } from "@/widgets/header";
import { TournamentParticipants } from "@/widgets/tournament-participants";
import { TournamentRegisterCta } from "@/features/tournament-register";
import {
  BlindStructureTable,
  MOCK_BLIND_STRUCTURE,
  MOCK_PARTICIPANTS,
  TournamentTypeBadge,
  type Tournament,
} from "@/entities/tournament";
import { cn } from "@/shared/lib/utils";

export interface TournamentDetailPageProps {
  tournament: Tournament;
}

export function TournamentDetailPage({ tournament }: TournamentDetailPageProps) {
  const [showStructure, setShowStructure] = useState(false);
  const t = tournament;

  return (
    <div className="pb-44">
      <Header title="Событие" showBack />
      <div className="px-4 space-y-4">
        <div className="rounded-2xl bg-gradient-to-br from-burgundy-700 to-burgundy-800 border border-amber-900/30 p-5">
          <div className="flex items-start justify-between mb-4 gap-3">
            <h2 className="text-white font-bold text-2xl">{t.name}</h2>
            <TournamentTypeBadge type={t.type} />
          </div>
          <div className="space-y-3 text-sm">
            <Row label="Место" value="Кожевенная линия, 30, Лофт Brosko" />
            <Row label="Время" value={`${t.date} / ${t.time}`} />
            <Row label="Места" value={`${t.seats}/${t.maxSeats}`} bold />
            <Row label="Стартовый стек" value={t.stack.toLocaleString()} bold />
            <Row label="Билет" value={`${t.ticket}₽`} accent last />
          </div>
        </div>

        <div className="rounded-2xl bg-burgundy-800/80 border border-amber-900/20 p-5">
          <h3 className="text-white font-bold text-lg mb-3">Формат турнира</h3>
          <p className="text-amber-100/80 text-sm leading-relaxed">
            Баунти турнир, где каждый нокаут приносит ULTRA-баунти.
            <br />
            <span className="text-amber-300 font-medium">
              ULTRA баунти = 150 очкам
            </span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowStructure((s) => !s)}
          className="w-full rounded-2xl bg-burgundy-800/80 border border-amber-900/20 p-4 active:scale-[0.99] transition"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              <span className="text-white font-bold">Структура турнира</span>
            </div>
            <ChevronDown
              className={cn(
                "w-5 h-5 text-amber-400 transition-transform",
                showStructure && "rotate-180"
              )}
            />
          </div>
        </button>

        {showStructure && (
          <div className="rounded-2xl bg-burgundy-800/80 border border-amber-900/20 p-4 -mt-2 animate-fade-in">
            <BlindStructureTable levels={MOCK_BLIND_STRUCTURE} />
          </div>
        )}

        <div className="rounded-2xl bg-gradient-to-br from-rose-900/30 to-rose-950/30 border border-rose-700/30 p-5">
          <h3 className="text-rose-300 font-bold mb-3 flex items-center gap-2">
            <Flame className="w-5 h-5" /> Важно
          </h3>
          <p className="text-amber-100/80 text-sm leading-relaxed">
            Пожалуйста, отменяйте участие заранее, если понимаете, что не сможете
            прийти. Неявка без предупреждения блокирует место для игроков из
            листа ожидания.
          </p>
        </div>

        <TournamentParticipants
          participants={MOCK_PARTICIPANTS}
          maxSeats={t.maxSeats}
        />

        <button
          type="button"
          className="w-full rounded-2xl bg-burgundy-800/80 border border-amber-900/20 p-4 active:scale-[0.99] transition flex items-center justify-center gap-2"
        >
          <Share2 className="w-5 h-5 text-amber-400" />
          <span className="text-white font-medium">Пригласить друзей</span>
        </button>
      </div>

      <TournamentRegisterCta tournamentId={t.id} />
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  accent,
  last,
}: {
  label: string;
  value: string;
  bold?: boolean;
  accent?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between py-2",
        !last && "border-b border-amber-900/20"
      )}
    >
      <span className="text-amber-200/60 uppercase text-xs tracking-wider">
        {label}
      </span>
      <span
        className={cn(
          "text-right max-w-[60%]",
          accent ? "text-amber-300 font-bold" : "text-white",
          bold && "font-bold"
        )}
      >
        {value}
      </span>
    </div>
  );
}
