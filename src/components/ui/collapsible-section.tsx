import * as React from "react"
import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible"
import { ChevronDownIcon } from "lucide-react"
import { cn } from "@/lib/utils"

/* -------------------------------------------------------------------------- */
/* Low-level Primitives (shadcn/base-ui pattern)                               */
/* -------------------------------------------------------------------------- */

const Collapsible = CollapsiblePrimitive.Root
const CollapsibleTrigger = CollapsiblePrimitive.Trigger
const CollapsibleContent = CollapsiblePrimitive.Panel

/* -------------------------------------------------------------------------- */
/* High-level CollapsibleSection Component                                    */
/* -------------------------------------------------------------------------- */

export interface CollapsibleSectionProps {
  /**
   * Main title of the section. Can be a string or a React node.
   */
  title: React.ReactNode
  /**
   * Optional subtitle or descriptive text displayed below the title.
   */
  description?: React.ReactNode
  /**
   * Optional icon component or node displayed before the title.
   * Can be a LucideIcon component (e.g. `icon={Wrench}`) or a JSX element (`icon={<Wrench />}`).
   */
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode
  /**
   * Optional badge or count displayed next to the title (e.g. "12 itens" or `<Badge>Novo</Badge>`).
   */
  badge?: React.ReactNode
  /**
   * Optional actions placed on the right side of the header (e.g. quick buttons, filters).
   * Clicks on this element will not toggle the collapsible section.
   */
  headerActions?: React.ReactNode
  /**
   * Controlled open state.
   */
  open?: boolean
  /**
   * Alias for `open` to support standard Brazilian/React naming conventions.
   */
  isOpen?: boolean
  /**
   * Initial open state when uncontrolled. Defaults to `true`.
   */
  defaultOpen?: boolean
  /**
   * Callback fired when open state changes.
   */
  onOpenChange?: (open: boolean) => void
  /**
   * Visual presentation style.
   * - 'card': Standard white card with subtle border and rounded corners (Default).
   * - 'bordered': Minimal bordered box with transparent background.
   * - 'ghost': Clean layout with no outer border, ideal for inline embedding.
   */
  variant?: "card" | "bordered" | "ghost"
  /**
   * Padding and typography density scale.
   */
  size?: "sm" | "md" | "lg"
  /**
   * Whether to keep DOM elements mounted when closed (useful for preserving form state).
   * Defaults to `false` (unmounts on close for performance).
   */
  keepMounted?: boolean
  /**
   * Whether the section is disabled and cannot be toggled.
   */
  disabled?: boolean
  /**
   * Unique HTML ID for accessibility and testing.
   */
  id?: string
  /**
   * Additional CSS classes for the outer container.
   */
  className?: string
  /**
   * Additional CSS classes for the header button / bar.
   */
  headerClassName?: string
  /**
   * Additional CSS classes for the content wrapper.
   */
  contentClassName?: string
  /**
   * Inner content to display inside the collapsible panel.
   */
  children?: React.ReactNode
}

export function CollapsibleSection({
  title,
  description,
  icon: IconProp,
  badge,
  headerActions,
  open: openProp,
  isOpen: isOpenProp,
  defaultOpen = true,
  onOpenChange,
  variant = "card",
  size = "md",
  keepMounted = false,
  disabled = false,
  id,
  className,
  headerClassName,
  contentClassName,
  children,
}: CollapsibleSectionProps) {
  // Resolve controlled vs uncontrolled open state
  const isControlled = openProp !== undefined || isOpenProp !== undefined
  const controlledValue = openProp !== undefined ? openProp : isOpenProp
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  
  const currentOpen = isControlled ? Boolean(controlledValue) : internalOpen

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(nextOpen)
      }
      onOpenChange?.(nextOpen)
    },
    [isControlled, onOpenChange]
  )

  // Style variants
  const variantStyles = {
    card: "bg-white border border-slate-200/80 rounded-2xl shadow-xs transition-shadow duration-150",
    bordered: "bg-transparent border border-slate-200 rounded-xl",
    ghost: "bg-transparent border-none",
  }

  const sizeHeaderStyles = {
    sm: "px-3.5 py-2.5 min-h-[42px]",
    md: "px-5 py-3.5 min-h-[52px]",
    lg: "px-6 py-4 min-h-[60px]",
  }

  const sizeContentStyles = {
    sm: "px-3.5 pb-3.5 pt-1",
    md: "px-5 pb-5 pt-1",
    lg: "px-6 pb-6 pt-2",
  }

  // Render icon helper
  const renderIcon = () => {
    if (!IconProp) return null
    if (React.isValidElement(IconProp)) {
      return <div className="shrink-0 text-[#1B3A2D]">{IconProp}</div>
    }
    const IconComponent = IconProp as React.ComponentType<{ className?: string }>
    return (
      <div className="shrink-0 text-[#1B3A2D]">
        <IconComponent className="size-4.5" />
      </div>
    )
  }

  return (
    <CollapsiblePrimitive.Root
      open={currentOpen}
      onOpenChange={handleOpenChange}
      disabled={disabled}
      id={id}
      data-slot="collapsible-section"
      className={cn("w-full overflow-hidden", variantStyles[variant], className)}
    >
      <div
        className={cn(
          "flex items-center justify-between gap-3 select-none",
          sizeHeaderStyles[size],
          currentOpen && variant !== "ghost" && "border-b border-slate-150/60",
          headerClassName
        )}
      >
        <CollapsiblePrimitive.Trigger
          type="button"
          disabled={disabled}
          className={cn(
            "flex flex-1 items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3A2D]/20 rounded-lg group transition-colors",
            disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
          )}
          aria-label={typeof title === "string" ? `Expandir ou recolher ${title}` : "Expandir ou recolher seção"}
        >
          {renderIcon()}

          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-heading font-semibold text-slate-900 text-sm tracking-tight group-hover:text-[#1B3A2D] transition-colors">
                {title}
              </span>
              {badge && (
                <div className="inline-flex shrink-0">
                  {typeof badge === "string" || typeof badge === "number" ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {badge}
                    </span>
                  ) : (
                    badge
                  )}
                </div>
              )}
            </div>
            {description && (
              <p className="text-xs text-slate-500 font-normal leading-relaxed mt-0.5">
                {description}
              </p>
            )}
          </div>

          <div
            className={cn(
              "flex items-center justify-center size-7 rounded-lg text-slate-400 group-hover:text-slate-600 group-hover:bg-slate-100 transition-all duration-200 shrink-0",
              currentOpen && "rotate-180 text-slate-700 bg-slate-50"
            )}
          >
            <ChevronDownIcon className="size-4" />
          </div>
        </CollapsiblePrimitive.Trigger>

        {headerActions && (
          <div
            className="flex items-center gap-2 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {headerActions}
          </div>
        )}
      </div>

      <CollapsiblePrimitive.Panel
        keepMounted={keepMounted}
        data-slot="collapsible-content"
        className={cn(
          "transition-all duration-200 ease-in-out",
          sizeContentStyles[size],
          contentClassName
        )}
      >
        {children}
      </CollapsiblePrimitive.Panel>
    </CollapsiblePrimitive.Root>
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
