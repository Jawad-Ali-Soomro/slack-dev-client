import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  size = "default",
  ...props
}) {
  const sizeVariants = {
    sm: "size-4",
    default: "size-5",
    lg: "size-6"
  };

  const iconVariants = {
    sm: "size-3",
    default: "size-4",
    lg: "size-5"
  };

  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shrink-0 rounded-[10px] border shadow-sm transition-all duration-200 outline-none disabled:cursor-not-allowed disabled:opacity-50",
        sizeVariants[size],
        className
      )}
      {...props}>
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-all duration-200">
        <CheckIcon className={cn(iconVariants[size])} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox }
