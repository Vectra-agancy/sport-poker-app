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
import { prisma } from "@/shared/api/prisma";

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
  let usedFreeTicket = false;
  let availableFreeTickets = 0;
  if (sessionUser) {
    const userId = Number(sessionUser.id);
    const [reg, dbUser] = await Promise.all([
      getUserRegistrationOnTournament(userId, id),
      prisma.user.findUnique({
        where: { id: userId },
        select: { freeTickets: true },
      }),
    ]);
    isRegistered =
      reg?.status === "registered" || reg?.status === "waitlist";
    isWaitlist = reg?.status === "waitlist";
    usedFreeTicket = Boolean(reg?.usedFreeTicket);
    availableFreeTickets = dbUser?.freeTickets ?? 0;
  }

  return (
    <>
      <TournamentDetailPage
        tournament={tournament}
        blinds={blinds}
        participants={participants}
        isRegistered={isRegistered}
        isWaitlist={isWaitlist}
        usedFreeTicket={usedFreeTicket}
        availableFreeTickets={availableFreeTickets}
      />
      <BottomNav />
    </>
  );
}
