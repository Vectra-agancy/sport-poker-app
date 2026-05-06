import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    throw new Error("DATABASE_URL is required (libsql://...?authToken=...)");
  }
  const { url, authToken } = parseLibsqlUrl(raw);
  const adapter = new PrismaLibSql({ url, authToken });
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

/**
 * libSQL accepts auth either via an embedded ?authToken= query param OR via a
 * separate constructor option. We keep ?authToken= in DATABASE_URL so the
 * Prisma CLI can authenticate as well, and split it out for the adapter here.
 */
function parseLibsqlUrl(raw: string): { url: string; authToken?: string } {
  if (!raw.startsWith("libsql:") && !raw.startsWith("https:") && !raw.startsWith("file:")) {
    return { url: raw };
  }
  if (raw.startsWith("file:")) return { url: raw };

  try {
    const u = new URL(raw);
    const token = u.searchParams.get("authToken") ?? process.env.TURSO_AUTH_TOKEN;
    u.searchParams.delete("authToken");
    return { url: u.toString(), authToken: token ?? undefined };
  } catch {
    return { url: raw };
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
