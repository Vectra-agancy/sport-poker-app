import { UserAvatar } from "@/entities/user";

export interface TournamentParticipantsProps {
  participants: string[];
  maxSeats: number;
}

export function TournamentParticipants({
  participants,
  maxSeats,
}: TournamentParticipantsProps) {
  const free = maxSeats - participants.length;
  return (
    <div className="rounded-2xl bg-burgundy-800/80 border border-amber-900/20 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-lg">Участники</h3>
        {free > 0 && (
          <span className="text-emerald-400 text-sm font-medium">
            ✓ Свободно {free} мест
          </span>
        )}
      </div>
      <div className="space-y-2">
        {participants.length === 0 ? (
          <div className="py-6 text-center text-amber-200/50 text-sm">
            Пока никто не записался — будьте первым!
          </div>
        ) : (
          participants.map((name, i) => (
            <div
              key={`${name}-${i}`}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-amber-900/10 transition"
            >
              <span className="text-amber-200/40 w-6 text-sm font-medium">
                {i + 1}
              </span>
              <UserAvatar name={name} size="md" />
              <span className="text-white font-medium truncate">{name}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
