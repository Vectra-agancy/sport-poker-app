"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/shared/api/prisma";
import { getCurrentUser } from "@/shared/lib/auth-helpers";

export interface FollowResult {
  ok: boolean;
  isFollowing?: boolean;
  error?: string;
}

export async function followUser(
  targetUserId: number
): Promise<FollowResult> {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return { ok: false, error: "Войдите, чтобы подписаться" };
  const followerId = Number(sessionUser.id);
  if (followerId === targetUserId) {
    return { ok: false, error: "Нельзя подписаться на себя" };
  }

  await prisma.follow.upsert({
    where: {
      followerId_followingId: {
        followerId,
        followingId: targetUserId,
      },
    },
    create: { followerId, followingId: targetUserId },
    update: {},
  });

  revalidatePath("/rating");
  revalidatePath("/");
  return { ok: true, isFollowing: true };
}

export async function unfollowUser(
  targetUserId: number
): Promise<FollowResult> {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return { ok: false, error: "Не авторизован" };
  const followerId = Number(sessionUser.id);

  await prisma.follow.deleteMany({
    where: { followerId, followingId: targetUserId },
  });

  revalidatePath("/rating");
  revalidatePath("/");
  return { ok: true, isFollowing: false };
}
