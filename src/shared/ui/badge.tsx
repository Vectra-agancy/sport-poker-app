import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-amber-500/40 bg-amber-500/20 text-amber-300",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-rose-500/40 bg-rose-500/20 text-rose-300",
        outline: "text-foreground border-amber-900/30",
        success:
          "border-emerald-500/40 bg-emerald-500/20 text-emerald-300",
        info: "border-blue-500/40 bg-blue-500/20 text-blue-300",
        amateur:
          "border-emerald-500/40 bg-emerald-500/20 text-emerald-300",
        purple:
          "border-purple-500/40 bg-purple-500/20 text-purple-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
