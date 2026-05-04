import { notFound } from "next/navigation";
import { TournamentDetailPage } from "@/views/tournament-detail";
import { BottomNav } from "@/widgets/bottom-nav";
import {
  getBlindStructure,
  getTournamentById,
  getTournamentParticipants,
  getUserRegistrationOnTournament,
} from "@/entities/tournament/server";
import { getCurrentUser } from "@/shared/lib/auth-helpers";

interface PageProps {
  params: { id: string };
}

export default async function Page({ params }: PageProps) {
  const id = Number(params.id);
  if (Number.isNaN(id)) notFound();

  const tournament = await getTournamentById(id);
  if (!tournament) notFound();

  const [blinds, participants, sessionUser] = await Promise.all([
    getBlindStructure(id),
    getTournamentParticipants(id),
    getCurrentUser(),
  ]);

  let isRegistered = false;
  let isWaitlist = false;
  if (sessionUser) {
    const reg = await getUserRegistrationOnTournament(
      Number(sessionUser.id),
      id
    );
    isRegistered =
      reg?.status === "registered" || reg?.status === "waitlist";
    isWaitlist = reg?.status === "waitlist";
  }

  return (
    <>
      <TournamentDetailPage
        tournament={tournament}
        blinds={blinds}
        participants={participants}
        isRegistered={isRegistered}
        isWaitlist={isWaitlist}
      />
      <BottomNav />
    </>
  );
}
