import Link from "next/link";
import { UserAvatar } from "@/entities/user";

export interface TournamentParticipantsProps {
  participants: string[];
  maxSeats: number;
}

export function TournamentParticipants({
  participants,
  maxSeats,
}: TournamentParticipantsProps) {
  const free = Math.max(0, maxSeats - participants.length);
  return (
    <div className="rounded-2xl bg-burgundy-800/80 border border-amber-900/20 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-lg">
          Участники{" "}
          <span className="text-amber-200/40 text-sm font-medium">
            {participants.length}/{maxSeats}
          </span>
        </h3>
        {free > 0 ? (
          <span className="text-emerald-400 text-sm font-medium">
            ✓ Свободно {free} мест
          </span>
        ) : (
          participants.length > 0 && (
            <span className="text-amber-300 text-sm font-medium">
              Мест нет
            </span>
          )
        )}
      </div>
      <div className="space-y-1">
        {participants.length === 0 ? (
          <div className="py-6 text-center text-amber-200/50 text-sm">
            Пока никто не записался — будьте первым!
          </div>
        ) : (
          participants.map((name, i) => {
            const isWaitlist = i >= maxSeats;
            return (
              <Link
                key={`${name}-${i}`}
                href={`/u/${encodeURIComponent(name)}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-amber-900/10 active:bg-amber-900/15 transition animate-rise-up"
                style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
              >
                <span className="text-amber-200/40 w-6 text-sm font-medium tabular-nums">
                  {i + 1}
                </span>
                <UserAvatar name={name} size="md" />
                <span className="text-white font-medium truncate">{name}</span>
                {isWaitlist && (
                  <span className="ml-auto text-[10px] uppercase px-1.5 py-0.5 rounded border border-amber-500/40 bg-amber-500/15 text-amber-300 whitespace-nowrap">
                    лист ожидания
                  </span>
                )}
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
