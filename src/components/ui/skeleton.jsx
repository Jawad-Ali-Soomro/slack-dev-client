import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-gray-200/80 dark:bg-white/10", className)}
      {...props} />
  );
}

export { Skeleton }
