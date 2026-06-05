import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center h-8 px-3 rounded-full text-xs font-semibold tracking-wide border transition-all select-none whitespace-nowrap gap-1.5",
  {
    variants: {
      variant: {
        default: "bg-[#1B3A2D] text-white border-transparent",
        secondary: "bg-slate-100 text-slate-700 border-slate-200/50",
        outline: "bg-white text-slate-700 border-slate-200",
        ativo: "bg-emerald-50 text-emerald-700 border-emerald-200",
        agendado: "bg-amber-50 text-amber-700 border-amber-200",
        concluido: "bg-teal-50 text-teal-700 border-teal-200",
        atraso: "bg-red-50 text-red-700 border-red-200",
        garantia: "bg-purple-50 text-purple-700 border-purple-200",
        blue: "bg-blue-50 text-blue-700 border-blue-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
