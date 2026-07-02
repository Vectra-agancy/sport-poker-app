"use client";

import { useState } from "react";
import { ChevronDown, Layers } from "lucide-react";
import { BlindStructureTable, type BlindLevel } from "@/entities/tournament";
import { cn } from "@/shared/lib/utils";

export interface CollapsibleStructureProps {
  blinds: BlindLevel[];
}

export function CollapsibleStructure({ blinds }: CollapsibleStructureProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl bg-burgundy-800/80 border border-amber-900/20 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        aria-expanded={open}
        className="w-full p-4 active:bg-amber-900/10 transition"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <span className="text-white font-bold">Структура турнира</span>
            <span className="text-xs text-amber-200/40">
              {blinds.length} ур.
            </span>
          </div>
          <ChevronDown
            className={cn(
              "w-5 h-5 text-amber-400 transition-transform duration-300",
              open && "rotate-180"
            )}
          />
        </div>
      </button>
      {/* Плавное раскрытие через grid-rows: контент остаётся в DOM */}
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4">
            <BlindStructureTable levels={blinds} />
          </div>
        </div>
      </div>
    </div>
  );
}
