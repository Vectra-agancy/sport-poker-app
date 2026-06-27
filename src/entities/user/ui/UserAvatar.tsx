import { cn } from "@/shared/lib/utils";

export interface UserAvatarProps {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZE_CLASSES = {
  sm: "w-8 h-8 text-xs",
  md: "w-9 h-9 text-sm",
  lg: "w-10 h-10 text-base",
  xl: "w-16 h-16 rounded-2xl text-2xl border-2 border-amber-500/50",
} as const;

export function UserAvatar({ name, size = "md", className }: UserAvatarProps) {
  return (
    <div
      className={cn(
        "shrink-0 flex items-center justify-center bg-gradient-to-br from-amber-600 via-amber-700 to-rose-900 text-white font-bold shadow-md shadow-black/30 select-none",
        size === "xl" ? "rounded-2xl" : "rounded-full",
        SIZE_CLASSES[size],
        className
      )}
    >
      {name[0]?.toUpperCase()}
    </div>
  );
}
