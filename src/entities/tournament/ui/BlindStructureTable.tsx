import type { BlindLevel } from "../model/types";

export interface BlindStructureTableProps {
  levels: BlindLevel[];
}

export function BlindStructureTable({ levels }: BlindStructureTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-amber-200/60 text-xs uppercase tracking-wider border-b border-amber-900/20">
            <th className="text-left py-2 font-medium">Уровень</th>
            <th className="text-right py-2 font-medium">SB / BB</th>
            <th className="text-right py-2 font-medium">Ante</th>
            <th className="text-right py-2 font-medium">Время</th>
          </tr>
        </thead>
        <tbody>
          {levels.map((b, i) => (
            <tr
              key={i}
              className={`border-b border-amber-900/10 ${
                b.isBreak ? "bg-amber-900/10" : ""
              }`}
            >
              <td className="py-2.5 text-white font-medium">
                {b.isBreak ? "☕ Перерыв" : `Lvl ${b.lvl}`}
              </td>
              <td className="text-right text-amber-100">
                {b.isBreak ? "—" : `${b.sb}/${b.bb}`}
              </td>
              <td className="text-right text-amber-100/70">
                {b.isBreak ? "—" : b.ante || "—"}
              </td>
              <td className="text-right text-amber-200/60">{b.dur} мин</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
