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
    <>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="w-full rounded-2xl bg-burgundy-800/80 border border-amber-900/20 p-4 active:scale-[0.99] transition"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <span className="text-white font-bold">Структура турнира</span>
          </div>
          <ChevronDown
            className={cn(
              "w-5 h-5 text-amber-400 transition-transform",
              open && "rotate-180"
            )}
          />
        </div>
      </button>
      {open && (
        <div className="rounded-2xl bg-burgundy-800/80 border border-amber-900/20 p-4 -mt-2 animate-fade-in">
          <BlindStructureTable levels={blinds} />
        </div>
      )}
    </>
  );
}
