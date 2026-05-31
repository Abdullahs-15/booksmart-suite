import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-[10px] border border-white/15 bg-white/[0.07] backdrop-blur-sm px-4 py-2 text-sm text-white shadow-sm transition-all duration-200 placeholder:text-white/35 focus:outline-none focus:border-indigo-500/80 focus:ring-[3px] focus:ring-indigo-500/15 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-white disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
