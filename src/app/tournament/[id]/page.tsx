import { notFound } from "next/navigation";
import { TournamentDetailPage } from "@/views/tournament-detail";
import { BottomNav } from "@/widgets/bottom-nav";
import { getTournamentById } from "@/entities/tournament";

interface PageProps {
  params: { id: string };
}

export default function Page({ params }: PageProps) {
  const id = Number(params.id);
  if (Number.isNaN(id)) notFound();
  const tournament = getTournamentById(id);
  if (!tournament) notFound();

  return (
    <>
      <TournamentDetailPage tournament={tournament} />
      <BottomNav />
    </>
  );
}
