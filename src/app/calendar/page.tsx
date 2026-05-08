import type { Metadata } from "next";
import { CalendarPage } from "@/views/calendar";
import { BottomNav } from "@/widgets/bottom-nav";
import { getAllTournaments } from "@/entities/tournament/server";

// Tournaments are fetched per-request from the DB; never pre-render at build.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Календарь",
  description: "Расписание ближайших и прошедших турниров RERAISE CLUB.",
};

export default async function Page() {
  const tournaments = await getAllTournaments();
  return (
    <>
      <CalendarPage tournaments={tournaments} />
      <BottomNav />
    </>
  );
}
