"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/shared/api/prisma";
import { getCurrentUser } from "@/shared/lib/auth-helpers";
import type {
  TournamentFormValues,
  TournamentLevelInput,
} from "../model/types";

const TOURNAMENT_TYPES = [
  "bounty",
  "no_raise",
  "amateur",
  "freezeout",
] as const;
const STATUSES = [
  "scheduled",
  "in_progress",
  "finished",
  "cancelled",
] as const;

type TournamentType = (typeof TOURNAMENT_TYPES)[number];
type TournamentStatus = (typeof STATUSES)[number];

export interface ActionResult {
  ok: boolean;
  id?: number;
  error?: string;
}

function validate(values: TournamentFormValues): string | null {
  if (!values.name?.trim()) return "Введите название турнира";
  if (!TOURNAMENT_TYPES.includes(values.type as TournamentType)) {
    return "Неверный тип турнира";
  }
  const startsAt = new Date(values.startsAt);
  if (Number.isNaN(startsAt.getTime())) return "Неверная дата начала";
  if (!values.location?.trim()) return "Введите место проведения";
  if (!Number.isFinite(values.maxSeats) || values.maxSeats <= 0) {
    return "Количество мест должно быть больше 0";
  }
  if (!Number.isFinite(values.startStack) || values.startStack <= 0) {
    return "Стартовый стек должен быть больше 0";
  }
  if (!Number.isFinite(values.ticketPrice) || values.ticketPrice < 0) {
    return "Цена билета не может быть отрицательной";
  }
  if (
    values.guarantee !== null &&
    (!Number.isFinite(values.guarantee) || values.guarantee < 0)
  ) {
    return "Гарантия не может быть отрицательной";
  }
  if (!Array.isArray(values.levels) || values.levels.length === 0) {
    return "Добавьте хотя бы один уровень";
  }
  for (let i = 0; i < values.levels.length; i++) {
    const l = values.levels[i];
    if (!Number.isFinite(l.level) || l.level !== i + 1) {
      return "Уровни должны идти по порядку (1, 2, 3...)";
    }
    if (!Number.isFinite(l.durationMin) || l.durationMin <= 0) {
      return `Уровень ${l.level}: длительность должна быть больше 0`;
    }
    if (!l.isBreak) {
      if (!Number.isFinite(l.smallBlind) || l.smallBlind < 0) {
        return `Уровень ${l.level}: SB не может быть отрицательным`;
      }
      if (!Number.isFinite(l.bigBlind) || l.bigBlind <= 0) {
        return `Уровень ${l.level}: BB должен быть больше 0`;
      }
      if (!Number.isFinite(l.ante) || l.ante < 0) {
        return `Уровень ${l.level}: ante не может быть отрицательным`;
      }
    }
  }
  return null;
}

function levelsToData(levels: TournamentLevelInput[]) {
  return levels.map((l) => ({
    level: l.level,
    smallBlind: l.isBreak ? 0 : l.smallBlind,
    bigBlind: l.isBreak ? 0 : l.bigBlind,
    ante: l.isBreak ? 0 : l.ante,
    durationMin: l.durationMin,
    isBreak: l.isBreak,
  }));
}

async function ensureAdmin() {
  const user = await getCurrentUser();
  if (!user || !user.isAdmin) return null;
  return user;
}

export async function createTournament(
  values: TournamentFormValues
): Promise<ActionResult> {
  const admin = await ensureAdmin();
  if (!admin) return { ok: false, error: "Доступ запрещён" };

  const err = validate(values);
  if (err) return { ok: false, error: err };

  const tournament = await prisma.tournament.create({
    data: {
      name: values.name.trim(),
      type: values.type,
      startsAt: new Date(values.startsAt),
      location: values.location.trim(),
      maxSeats: values.maxSeats,
      startStack: values.startStack,
      ticketPrice: values.ticketPrice,
      guarantee: values.guarantee,
      format: values.format?.trim() || null,
      seasonId: values.seasonId ?? null,
      createdById: Number(admin.id),
      levels: { create: levelsToData(values.levels) },
    },
  });

  revalidatePath("/admin");
  revalidatePath("/calendar");
  revalidatePath("/");
  return { ok: true, id: tournament.id };
}

export async function updateTournament(
  id: number,
  values: TournamentFormValues,
  status?: string
): Promise<ActionResult> {
  const admin = await ensureAdmin();
  if (!admin) return { ok: false, error: "Доступ запрещён" };

  const err = validate(values);
  if (err) return { ok: false, error: err };

  if (status && !STATUSES.includes(status as TournamentStatus)) {
    return { ok: false, error: "Неверный статус" };
  }

  await prisma.$transaction([
    prisma.tournamentLevel.deleteMany({ where: { tournamentId: id } }),
    prisma.tournament.update({
      where: { id },
      data: {
        name: values.name.trim(),
        type: values.type,
        startsAt: new Date(values.startsAt),
        location: values.location.trim(),
        maxSeats: values.maxSeats,
        startStack: values.startStack,
        ticketPrice: values.ticketPrice,
        guarantee: values.guarantee,
        format: values.format?.trim() || null,
        seasonId: values.seasonId ?? null,
        ...(status ? { status } : {}),
        levels: { create: levelsToData(values.levels) },
      },
    }),
  ]);

  revalidatePath("/admin");
  revalidatePath(`/admin/tournaments/${id}/edit`);
  revalidatePath(`/tournament/${id}`);
  revalidatePath("/calendar");
  revalidatePath("/");
  return { ok: true, id };
}

export async function deleteTournament(id: number): Promise<ActionResult> {
  const admin = await ensureAdmin();
  if (!admin) return { ok: false, error: "Доступ запрещён" };

  await prisma.tournament.delete({ where: { id } });

  revalidatePath("/admin");
  revalidatePath("/calendar");
  revalidatePath("/");
  return { ok: true };
}
