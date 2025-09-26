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
        "flex w-full rounded-lg border border-input bg-background shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary focus-visible:shadow-md transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
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