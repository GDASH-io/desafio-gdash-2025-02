import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    value?: number;
  }
>(({ className, value = 0, ...props }, ref) => {
  // Definindo cores conforme o valor da bateria
  let color = "bg-red-500"
  let fadedColor = "bg-red-500/20"

  if (value >= 70) {
    color = "bg-green-500"
    fadedColor = "bg-green-500/20"
  } else if (value >= 40) {
    color = "bg-yellow-500"
    fadedColor = "bg-yellow-500/20"
  }

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full", fadedColor,
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn("h-full w-full flex-1 transition-all", color)}
        style={{ transform: `translateX(-${100 - value}%)` }}
      />
    </ProgressPrimitive.Root>
  )
})

Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
