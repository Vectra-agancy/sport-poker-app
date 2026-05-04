"use client";

import { useRouter } from "next/navigation";
import {
  TournamentCard,
  type Tournament,
} from "@/entities/tournament";

export interface TournamentListProps {
  tournaments: Tournament[];
}

export function TournamentList({ tournaments }: TournamentListProps) {
  const router = useRouter();
  return (
    <div className="space-y-3">
      {tournaments.map((t) => (
        <TournamentCard
          key={t.id}
          tournament={t}
          onClick={() => router.push(`/tournament/${t.id}`)}
        />
      ))}
    </div>
  );
}
