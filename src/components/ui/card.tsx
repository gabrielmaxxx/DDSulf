import * as React from "react"
import { cn } from "@/lib/utils"

function Card({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm" }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        "group/card flex flex-col gap-5 overflow-hidden rounded-2xl border border-slate-200/40 bg-white p-6 text-sm text-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-all duration-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)]",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header flex flex-col gap-1.5 pb-2",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "font-sans text-[22px] font-semibold text-slate-800 tracking-tight leading-snug",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-xs text-slate-500 font-medium tracking-wide leading-relaxed", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "ml-auto",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("pt-2", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center border-t border-slate-100 pt-4 mt-4 bg-transparent",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  KpiCard,
}

function KpiCard({
  title,
  value,
  trend,
  trendType = 'default',
  icon: Icon,
  className
}: {
  title: string;
  value: string | number;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral' | 'default';
  icon?: any;
  className?: string;
}) {
  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">{title}</span>
        {Icon && <Icon className="size-5 text-slate-300 shrink-0" />}
      </div>
      <div className="mt-2.5 flex flex-col gap-1 text-left">
        <span className="text-[32px] font-black text-slate-800 tracking-tight leading-none">{value}</span>
        {trend && (
          <span className={cn(
            "text-xs font-bold tracking-wide mt-1",
            trendType === 'positive' && "text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md w-fit",
            trendType === 'negative' && "text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-md w-fit",
            trendType === 'neutral' && "text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md w-fit",
            trendType === 'default' && "text-slate-500 bg-slate-50 border border-slate-100 px-3 py-1 rounded-md w-fit"
          )}>
            {trend}
          </span>
        )}
      </div>
    </Card>
  )
}
