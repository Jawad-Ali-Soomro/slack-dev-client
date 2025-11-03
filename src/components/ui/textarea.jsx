import * as React from "react"
import { cn } from "../../lib/utils"

const Textarea = React.forwardRef(({ className, size = "default", ...props }, ref) => {
  const sizeVariants = {
    sm: "min-h-[60px] px-2.5 py-2 text-sm",
    default: "min-h-[80px] px-3 py-2.5 text-sm",
    lg: "min-h-[100px] px-4 py-3 text-base"
  };

  return (
    <textarea
      className={cn(
        "flex w-full rounded-[10px] border border-input shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus:border-gray-400 dark:focus:border-gray-600 focus-visible:shadow-md transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        sizeVariants[size],
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }