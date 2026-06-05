import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center font-sans tracking-wide text-sm font-semibold whitespace-nowrap transition-all outline-none select-none active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 rounded-xl",
  {
    variants: {
      variant: {
        default: "bg-[#1B3A2D] text-white hover:bg-[#1B3A2D]/90 border border-transparent shadow-[0_2px_4px_rgba(27,58,45,0.08)]",
        outline: "border-[#1B3A2D] bg-white text-[#1B3A2D] hover:bg-[#1B3A2D]/5 border",
        secondary: "border-[#1B3A2D] bg-white text-[#1B3A2D] hover:bg-[#1B3A2D]/5 border",
        ghost: "text-[#1B3A2D] hover:bg-[#1B3A2D]/10 bg-transparent",
        destructive: "bg-red-600 text-white hover:bg-red-700 border border-transparent shadow-[0_2px_4px_rgba(220,38,38,0.08)]",
        link: "text-[#1B3A2D] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-[44px] gap-2 px-5 text-sm",
        xs: "h-8 gap-1 px-3 text-xs",
        sm: "h-9 gap-1.5 px-3.5 text-xs",
        lg: "h-[48px] gap-2 px-6 text-sm",
        icon: "size-11",
        "icon-xs": "size-8",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
