import { NextResponse } from "next/server";
import { recomputeGlobalRating } from "@/entities/rating/server";

export const dynamic = "force-dynamic";

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(req: Request) {
  if (CRON_SECRET) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const result = await recomputeGlobalRating();
  return NextResponse.json({ ok: true, ...result });
}
