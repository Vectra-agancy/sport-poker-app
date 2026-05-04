import { Header } from "@/widgets/header";
import { RatingPodium } from "@/widgets/rating-podium";
import type { RatingRow, RatingScope } from "@/entities/rating";
import { RatingScopeTabs } from "./RatingScopeTabs";

export interface RatingPageProps {
  rows: RatingRow[];
  activeScope: RatingScope;
  myPosition: { position: number; targetPosition?: number; pointsGap?: number } | null;
}

export function RatingPage({ rows, activeScope, myPosition }: RatingPageProps) {
  return (
    <div className="pb-28">
      <Header title="Рейтинг" />
      <div className="px-4 space-y-4">
        <RatingScopeTabs initialScope={activeScope} initialRows={rows} />

        {rows.length >= 3 && (
          <RatingPodium top3={rows.slice(0, 3)} variant="podium" />
        )}

        {myPosition && (
          <div className="rounded-2xl bg-gradient-to-r from-amber-900/30 to-amber-950/30 border border-amber-600/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-amber-200/60 uppercase tracking-wider mb-1">
                  Ваша позиция
                </div>
                <div className="text-2xl font-bold text-white">
                  #{myPosition.position}
                </div>
              </div>
              {myPosition.targetPosition && myPosition.pointsGap !== undefined && (
                <div className="text-right">
                  <div className="text-xs text-amber-200/60">
                    До #{myPosition.targetPosition} нужно
                  </div>
                  <div className="text-amber-300 font-bold">
                    {myPosition.pointsGap} очк{pluralPoints(myPosition.pointsGap)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function pluralPoints(n: number): string {
  const lastDigit = n % 10;
  const lastTwo = n % 100;
  if (lastTwo >= 11 && lastTwo <= 14) return "ов";
  if (lastDigit === 1) return "о";
  if (lastDigit >= 2 && lastDigit <= 4) return "а";
  return "ов";
}
