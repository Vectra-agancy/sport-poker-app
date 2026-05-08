// Pure point-calculation helpers used by both the form preview and the
// server-side recompute. Keep in lib/ so it stays free of prisma/server deps.

const PLACE_TABLE: Record<number, number> = {
  1: 1000,
  2: 700,
  3: 500,
  4: 400,
  5: 350,
  6: 300,
  7: 250,
  8: 200,
  9: 150,
  10: 100,
};

export function pointsForPlace(place: number, maxSeats: number): number {
  if (!Number.isFinite(place) || place <= 0) return 0;
  const fixed = PLACE_TABLE[place];
  if (fixed !== undefined) return fixed;
  // ITM band (top half) gets a small participation bonus, the rest get less.
  if (place <= Math.ceil(Math.max(1, maxSeats) / 2)) return 50;
  return 25;
}

export function bountyPointValue(tournamentType: string): number {
  // "bounty" turnirs use ULTRA баунти = 150; others get a baseline 100.
  return tournamentType === "bounty" ? 150 : 100;
}

export function totalPoints(
  place: number,
  bounties: number,
  maxSeats: number,
  tournamentType: string
): number {
  const safeBounties =
    Number.isFinite(bounties) && bounties >= 0 ? Math.floor(bounties) : 0;
  return (
    pointsForPlace(place, maxSeats) +
    safeBounties * bountyPointValue(tournamentType)
  );
}
