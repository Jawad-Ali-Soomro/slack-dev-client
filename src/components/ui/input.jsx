import * as React from "react"

import { cn } from "@/lib/utils"

function Input({
  className,
  type,
  size = "default",
  ...props
}) {
  const sizeVariants = {
    sm: "h-12 px-2.5 text-sm rounded-[15px]",
    default: "h-12 px-3 text-sm rounded-[15px]",
    lg: "h-12 px-4 text-base rounded-[15px]",
    xl: "h-12 px-4 text-base rounded-[15px]"
  };

  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground border bg-white dark:bg-transparent w-full min-w-0 border dark:border-gray-600 bg-transparent py-2 transition-all duration-200 outline-none file:inline-flex file:border-0 file:bg-transparent file:text-sm file: disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus:border-gray-200 dark:focus:border-gray-600 focus-visible:ring-1",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        sizeVariants[size],
        className
      )}
      {...props} />
  );
}

export { Input }