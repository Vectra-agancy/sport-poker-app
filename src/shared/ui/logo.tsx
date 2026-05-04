import { cn } from "@/shared/lib/utils";

type LogoSize = "sm" | "md" | "lg";

const SIZE_CLASSES: Record<LogoSize, string> = {
  sm: "w-8 h-8 text-base",
  md: "w-12 h-12 text-xl",
  lg: "w-16 h-16 text-2xl",
};

export interface LogoProps {
  size?: LogoSize;
  className?: string;
}

export function Logo({ size = "md", className }: LogoProps) {
  return (
    <div
      className={cn(
        SIZE_CLASSES[size],
        "flex items-center justify-center rounded-lg bg-gradient-to-br from-amber-700/40 to-amber-900/40 border border-amber-600/30",
        className
      )}
    >
      <span className="font-serif text-amber-200">R</span>
    </div>
  );
}
