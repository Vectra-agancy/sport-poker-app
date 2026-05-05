import { CalendarPage } from "@/views/calendar";
import { BottomNav } from "@/widgets/bottom-nav";
import { getAllTournaments } from "@/entities/tournament/server";

// Tournaments are fetched per-request from the DB; never pre-render at build.
export const dynamic = "force-dynamic";

export default async function Page() {
  const tournaments = await getAllTournaments();
  return (
    <>
      <CalendarPage tournaments={tournaments} />
      <BottomNav />
    </>
  );
}
