import type { TournamentType, TournamentTypeMeta } from "./types";

export const TOURNAMENT_TYPES: Record<TournamentType, TournamentTypeMeta> = {
  bounty: {
    label: "Bounty",
    className: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  },
  no_raise: {
    label: "No raise",
    className: "bg-blue-500/20 text-blue-300 border-blue-500/40",
  },
  amateur: {
    label: "Amateur",
    className: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  },
  freezeout: {
    label: "Freezeout",
    className: "bg-purple-500/20 text-purple-300 border-purple-500/40",
  },
};

export type TournamentStatus =
  | "scheduled"
  | "in_progress"
  | "finished"
  | "cancelled";

export const TOURNAMENT_STATUSES: Record<
  TournamentStatus,
  { label: string; className: string }
> = {
  scheduled: {
    label: "Запланирован",
    className: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  },
  in_progress: {
    label: "Идёт",
    className: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  },
  finished: {
    label: "Завершён",
    className: "bg-slate-500/20 text-slate-300 border-slate-500/40",
  },
  cancelled: {
    label: "Отменён",
    className: "bg-rose-500/20 text-rose-300 border-rose-500/40",
  },
};
