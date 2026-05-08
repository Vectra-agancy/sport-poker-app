"use client";

import { TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

export interface RatingChartProps {
  points: { date: string; points: number }[];
  delta: number;
  rangeLabel?: string;
}

export function RatingChart({
  points,
  delta,
  rangeLabel = "30 дней",
}: RatingChartProps) {
  const hasEnoughData = points.length >= 2;
  const deltaSign = delta > 0 ? "+" : "";
  const deltaColor =
    delta > 0
      ? "text-emerald-400"
      : delta < 0
      ? "text-rose-400"
      : "text-amber-200/60";

  return (
    <div className="rounded-2xl bg-burgundy-800/80 border border-amber-900/20 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-400" />
          Динамика рейтинга
        </h3>
        <span className="text-xs text-amber-200/60">{rangeLabel}</span>
      </div>

      {hasEnoughData ? (
        <div className="h-20">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={points}
              margin={{ top: 4, right: 4, left: 4, bottom: 0 }}
            >
              <defs>
                <linearGradient id="rating-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(251, 191, 36)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="rgb(251, 191, 36)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" hide />
              <Tooltip
                cursor={{
                  stroke: "rgba(251, 191, 36, 0.4)",
                  strokeWidth: 1,
                }}
                contentStyle={{
                  background: "#1a0a0c",
                  border: "1px solid rgba(180, 83, 9, 0.4)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: "rgba(253, 230, 138, 0.7)" }}
                itemStyle={{ color: "#fcd34d" }}
                formatter={(value) => {
                  const n = typeof value === "number" ? value : Number(value);
                  return [
                    Number.isFinite(n) ? n.toLocaleString("ru-RU") : String(value ?? ""),
                    "очки",
                  ];
                }}
              />
              <Area
                type="monotone"
                dataKey="points"
                stroke="rgb(251, 191, 36)"
                strokeWidth={2}
                fill="url(#rating-grad)"
                dot={false}
                activeDot={{ r: 3, fill: "rgb(251, 191, 36)" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-20 flex items-center justify-center text-amber-200/40 text-xs text-center px-4">
          Сыграйте хотя бы пару турниров, чтобы появился график
        </div>
      )}

      {hasEnoughData && (
        <div className={`text-sm font-medium mt-2 ${deltaColor}`}>
          {deltaSign}
          {delta.toLocaleString("ru-RU")} очк{pluralPoints(Math.abs(delta))} за период
        </div>
      )}
    </div>
  );
}

function pluralPoints(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "о";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "а";
  return "ов";
}
