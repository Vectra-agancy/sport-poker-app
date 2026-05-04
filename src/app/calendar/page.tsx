import { CalendarPage } from "@/views/calendar";
import { BottomNav } from "@/widgets/bottom-nav";
import { getAllTournaments } from "@/entities/tournament/server";

export default async function Page() {
  const tournaments = await getAllTournaments();
  return (
    <>
      <CalendarPage tournaments={tournaments} />
      <BottomNav />
    </>
  );
}
