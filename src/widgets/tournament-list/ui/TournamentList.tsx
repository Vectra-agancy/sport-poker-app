import Link from "next/link";
import { TournamentCard, type Tournament } from "@/entities/tournament";

export interface TournamentListProps {
  tournaments: Tournament[];
  /** When true (default), wraps each card in a link to the detail page. */
  linked?: boolean;
}

export function TournamentList({
  tournaments,
  linked = true,
}: TournamentListProps) {
  return (
    <div className="space-y-3">
      {tournaments.map((t) =>
        linked ? (
          <Link key={t.id} href={`/tournament/${t.id}`} className="block">
            <TournamentCard tournament={t} />
          </Link>
        ) : (
          <TournamentCard key={t.id} tournament={t} />
        )
      )}
    </div>
  );
}
