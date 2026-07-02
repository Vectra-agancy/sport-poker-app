"use client";

import { cn } from "@/shared/lib/utils";

export interface NativeSelectOption {
  value: string;
  label: string;
}

export function NativeSelect({
  value,
  onChange,
  options,
  className,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  options: NativeSelectOption[];
  className?: string;
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "w-full rounded-md border border-amber-900/30 bg-burgundy-900/40 px-3 py-2 text-sm text-foreground focus:outline-none focus:border-amber-600/40 disabled:opacity-50",
        className
      )}
    >
      {options.map((o) => (
        <option
          key={o.value}
          value={o.value}
          className="bg-burgundy-900 text-foreground"
        >
          {o.label}
        </option>
      ))}
    </select>
  );
}
