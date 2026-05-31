import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-[20px] border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-indigo-500/20 text-indigo-300 border-indigo-500/35",
        secondary:
          "border-transparent bg-white/10 text-white/80 border-white/15",
        destructive:
          "border-transparent bg-red-500/15 text-red-300 border-red-500/35",
        outline: "border-white/20 text-white/80",
        success: "border-transparent bg-emerald-500/15 text-emerald-300 border-emerald-500/35",
        warning: "border-transparent bg-amber-500/15 text-amber-300 border-amber-500/35",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
