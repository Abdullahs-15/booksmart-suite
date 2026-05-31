import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-[10px] border border-white/15 bg-white/[0.07] backdrop-blur-sm px-4 py-3 text-sm text-white shadow-sm transition-all duration-200 placeholder:text-white/35 focus:outline-none focus:border-indigo-500/80 focus:ring-[3px] focus:ring-indigo-500/15 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
