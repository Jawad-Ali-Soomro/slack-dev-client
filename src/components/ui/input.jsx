import * as React from "react"

import { cn } from "@/lib/utils"

function Input({
  className,
  type,
  size = "default",
  ...props
}) {
  const sizeVariants = {
    sm: "h-12 px-2.5 text-sm rounded-lg",
    default: "h-12 px-3 text-sm rounded-lg",
    lg: "h-12 px-4 text-base rounded-lg",
    xl: "h-12 px-4 text-base rounded-lg"
  };

  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground bg-gray-100 dark:bg-black border-input w-full min-w-0 border bg-transparent py-2 shadow-sm transition-all duration-200 outline-none file:inline-flex file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 focus-visible:shadow-md",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        sizeVariants[size],
        className
      )}
      {...props} />
  );
}

export { Input }
