import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-[48px] w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3.5 text-sm transition-all outline-none placeholder:text-slate-400 focus-visible:border-[#1B3A2D] focus-visible:ring-2 focus-visible:ring-[#1B3A2D]/10 disabled:pointer-events-none disabled:bg-slate-50 disabled:opacity-60",
        className
      )}
      {...props}
    />
  )
}

export { Input }
