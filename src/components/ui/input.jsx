import * as React from "react"

import { cn } from "@/lib/utils"

function Input({
  className,
  type,
  size = "default",
  ...props
}) {
  const sizeVariants = {
    sm: "h-8 px-2.5 text-sm",
    default: "h-10 px-3 text-sm",
    lg: "h-11 px-4 text-base"
  };

  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input w-full min-w-0 rounded-lg border bg-transparent py-2 shadow-sm transition-all duration-200 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:shadow-md",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        sizeVariants[size],
        className
      )}
      {...props} />
  );
}

export { Input }
