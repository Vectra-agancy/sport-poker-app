import { TrendingUp } from "lucide-react";

export interface RatingChartProps {
  delta?: number;
  rangeLabel?: string;
}

export function RatingChart({
  delta = 340,
  rangeLabel = "30 дней",
}: RatingChartProps) {
  return (
    <div className="rounded-2xl bg-burgundy-800/80 border border-amber-900/20 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-400" />
          Динамика рейтинга
        </h3>
        <span className="text-xs text-amber-200/60">{rangeLabel}</span>
      </div>
      <svg viewBox="0 0 300 80" className="w-full h-20">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(251, 191, 36, 0.4)" />
            <stop offset="100%" stopColor="rgba(251, 191, 36, 0)" />
          </linearGradient>
        </defs>
        <path
          d="M0,60 L30,55 L60,50 L90,40 L120,45 L150,30 L180,35 L210,25 L240,20 L270,15 L300,10 L300,80 L0,80 Z"
          fill="url(#chartGrad)"
        />
        <path
          d="M0,60 L30,55 L60,50 L90,40 L120,45 L150,30 L180,35 L210,25 L240,20 L270,15 L300,10"
          fill="none"
          stroke="rgb(251, 191, 36)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="300" cy="10" r="3" fill="rgb(251, 191, 36)" />
      </svg>
      <div className="text-emerald-400 text-sm font-medium mt-2">
        +{delta} очков за месяц
      </div>
    </div>
  );
}
