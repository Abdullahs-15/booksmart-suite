import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-indigo-500/80 to-violet-500/80 backdrop-blur-sm border border-indigo-500/50 text-white rounded-[10px] font-medium shadow-lg hover:from-indigo-500 hover:to-violet-500 hover:shadow-xl hover:shadow-indigo-500/25 active:scale-[0.98]",
        destructive:
          "bg-red-500/20 backdrop-blur-sm border border-red-500/40 text-red-300 rounded-[10px] font-medium hover:bg-red-500/35 hover:border-red-500/60 active:scale-[0.98]",
        outline:
          "bg-white/5 backdrop-blur-md border border-white/15 text-white rounded-[10px] hover:bg-white/10 hover:border-white/25 active:scale-[0.98]",
        secondary:
          "bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-[10px] hover:bg-white/10 active:scale-[0.98]",
        ghost: "bg-transparent text-white/70 hover:bg-white/5 hover:text-white active:scale-[0.98]",
        link: "text-indigo-400 underline-offset-4 hover:underline hover:text-indigo-300",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-[10px] px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
