import { Flame } from "lucide-react";
import { Header } from "@/widgets/header";
import { TournamentParticipants } from "@/widgets/tournament-participants";
import { TournamentRegisterCta } from "@/features/tournament-register";
import { ShareTournamentButton } from "@/features/share-tournament";
import {
  TournamentTypeBadge,
  type BlindLevel,
  type Tournament,
  type TournamentType,
} from "@/entities/tournament";
import { cn } from "@/shared/lib/utils";
import { CollapsibleStructure } from "./CollapsibleStructure";

export interface TournamentDetailPageProps {
  tournament: Tournament;
  blinds: BlindLevel[];
  participants: string[];
  isRegistered: boolean;
  isWaitlist: boolean;
  usedFreeTicket: boolean;
  availableFreeTickets: number;
}

/** Запасное описание, когда у турнира не заполнено поле «формат». */
const FORMAT_FALLBACK: Record<TournamentType, string> = {
  bounty:
    "Баунти-турнир: за каждый нокаут — награда. ULTRA-баунти приносит 150 очков к рейтингу.",
  no_raise:
    "Формат No Raise — без рейзов, ровные банки и больше игры на постфлопе.",
  amateur:
    "Любительский формат — комфортный темп и дружелюбная атмосфера для новичков.",
  freezeout:
    "Freezeout: одна попытка, без ре-энтри. Вылетел — болеешь за своих.",
};

export function TournamentDetailPage({
  tournament,
  blinds,
  participants,
  isRegistered,
  isWaitlist,
  usedFreeTicket,
  availableFreeTickets,
}: TournamentDetailPageProps) {
  const t = tournament;
  const isFinished = t.status === "finished";
  const isCancelled = t.status === "cancelled";
  const isOpenForRegistration = !isFinished && !isCancelled;

  return (
    <div className={cn(isOpenForRegistration ? "pb-44" : "pb-28")}>
      <Header title="Событие" showBack />
      <div className="px-4 space-y-4">
        <div className="rounded-2xl bg-gradient-to-br from-burgundy-700 to-burgundy-800 border border-amber-900/30 p-5 animate-rise-up">
          <div className="flex items-start justify-between mb-4 gap-3">
            <h2 className="text-white font-bold text-2xl">{t.name}</h2>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <TournamentTypeBadge type={t.type} />
              {t.status === "in_progress" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </span>
                  Идёт сейчас
                </span>
              )}
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <Row label="Место" value={t.location} />
            <Row label="Время" value={`${t.day}, ${t.date} в ${t.time}`} bold />
            <Row label="Места" value={`${t.seats}/${t.maxSeats}`} bold />
            <Row
              label="Стартовый стек"
              value={t.stack.toLocaleString()}
              bold
            />
            {t.guarantee ? (
              <Row
                label="Гарантия"
                value={`${t.guarantee.toLocaleString()}₽`}
                accent
              />
            ) : null}
            <Row label="Билет" value={`${t.ticket.toLocaleString()}₽`} accent last />
          </div>
        </div>

        {isCancelled && (
          <div className="rounded-2xl border border-rose-700/40 bg-rose-900/30 p-4 text-rose-200 text-sm font-medium text-center animate-rise-up">
            Турнир отменён
          </div>
        )}
        {isFinished && (
          <div className="rounded-2xl border border-slate-500/30 bg-slate-800/30 p-4 text-slate-200 text-sm font-medium text-center animate-rise-up">
            Турнир завершён — результаты уже в рейтинге
          </div>
        )}

        <div
          className="rounded-2xl bg-burgundy-800/80 border border-amber-900/20 p-5 animate-rise-up"
          style={{ animationDelay: "60ms" }}
        >
          <h3 className="text-white font-bold text-lg mb-3">Формат турнира</h3>
          <p className="text-amber-100/80 text-sm leading-relaxed whitespace-pre-line">
            {t.format?.trim() || FORMAT_FALLBACK[t.type]}
          </p>
        </div>

        {blinds.length > 0 && (
          <div className="animate-rise-up" style={{ animationDelay: "120ms" }}>
            <CollapsibleStructure blinds={blinds} />
          </div>
        )}

        {isOpenForRegistration && (
          <div
            className="rounded-2xl bg-gradient-to-br from-rose-900/30 to-rose-950/30 border border-rose-700/30 p-5 animate-rise-up"
            style={{ animationDelay: "180ms" }}
          >
            <h3 className="text-rose-300 font-bold mb-3 flex items-center gap-2">
              <Flame className="w-5 h-5" /> Важно
            </h3>
            <p className="text-amber-100/80 text-sm leading-relaxed">
              Пожалуйста, отменяйте участие заранее, если понимаете, что не
              сможете прийти. Неявка без предупреждения блокирует место для
              игроков из листа ожидания.
            </p>
          </div>
        )}

        <div className="animate-rise-up" style={{ animationDelay: "240ms" }}>
          <TournamentParticipants
            participants={participants}
            maxSeats={t.maxSeats}
          />
        </div>

        <div className="animate-rise-up" style={{ animationDelay: "300ms" }}>
          <ShareTournamentButton
            tournamentId={t.id}
            tournamentName={t.name}
          />
        </div>
      </div>

      {isOpenForRegistration && (
        <TournamentRegisterCta
          tournamentId={t.id}
          ticketPrice={t.ticket}
          initialRegistered={isRegistered}
          initialWaitlist={isWaitlist}
          initialUsedFreeTicket={usedFreeTicket}
          availableFreeTickets={availableFreeTickets}
        />
      )}
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
