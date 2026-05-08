import type { MetadataRoute } from "next";
import { prisma } from "@/shared/api/prisma";

// Revalidate every hour — sitemap reflects DB state without forcing a build.
export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://reraise.club";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Guard against DB being unreachable during build — sitemap should still
  // ship even if the DB query fails (we'll just emit static entries).
  let tournaments: { id: number; updatedAt: Date }[] = [];
  try {
    tournaments = await prisma.tournament.findMany({
      where: { status: { in: ["scheduled", "in_progress", "finished"] } },
      select: { id: true, updatedAt: true },
      orderBy: { startsAt: "desc" },
      take: 200,
    });
  } catch (err) {
    console.warn("[sitemap] tournament fetch failed", err);
  }

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/calendar`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/rating`, changeFrequency: "daily", priority: 0.8 },
  ];

  const tournamentEntries: MetadataRoute.Sitemap = tournaments.map((t) => ({
    url: `${SITE_URL}/tournament/${t.id}`,
    lastModified: t.updatedAt,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  return [...staticEntries, ...tournamentEntries];
}
