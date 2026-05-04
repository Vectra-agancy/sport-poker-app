import type { Session } from "next-auth";
import { auth } from "@/shared/api/auth";
import { prisma } from "@/shared/api/prisma";

export type SessionUser = NonNullable<Session["user"]>;

/**
 * Returns the authenticated session user (lightweight, from JWT) or null.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = (await auth()) as Session | null;
  return session?.user ?? null;
}

/**
 * Loads the full DB user for the active session, or null.
 */
export async function getCurrentDbUser() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return null;
  const userId = Number(sessionUser.id);
  if (!Number.isFinite(userId)) return null;
  return prisma.user.findUnique({ where: { id: userId } });
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (!user.isAdmin) {
    throw new Response(JSON.stringify({ error: "forbidden" }), {
      status: 403,
      headers: { "content-type": "application/json" },
    });
  }
  return user;
}
