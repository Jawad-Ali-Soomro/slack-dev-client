import * as React from "react"
import { cn } from "../../lib/utils"

const Progress = React.forwardRef(({ className, value = 0, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-[10px] bg-gray-200 dark:bg-gray-700",
      className
    )}
    {...props}
  >
    <div
      className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300 ease-in-out"
      style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
    />
  </div>
))
Progress.displayName = "Progress"

export { Progress }
