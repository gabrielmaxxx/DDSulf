import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface HeaderMetricProps {
  label: string;
  value: string;
  delta?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
  className?: string;
  id?: string;
}

export function HeaderMetric({
  label,
  value,
  delta,
  className,
  id,
}: HeaderMetricProps) {
  return (
    <div id={id} className={cn("flex flex-col gap-0.5 min-w-[120px]", className)}>
      {/* Rótulo pequeno acima em cinza / uppercase */}
      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 select-none">
        {label}
      </span>

      {/* Valor grande em bold (sem borda, sem caixa, sem fundo) */}
      <span className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 font-sans">
        {value}
      </span>

      {/* Variação percentual colorida abaixo */}
      {delta && (
        <div
          className={cn(
            "flex items-center gap-1 text-xs font-semibold tracking-tight",
            delta.direction === 'up' && "text-emerald-600",
            delta.direction === 'down' && "text-rose-600",
            delta.direction === 'neutral' && "text-slate-500"
          )}
        >
          {delta.direction === 'up' && (
            <TrendingUp className="size-3.5 stroke-[2.5]" aria-hidden="true" />
          )}
          {delta.direction === 'down' && (
            <TrendingDown className="size-3.5 stroke-[2.5]" aria-hidden="true" />
          )}
          {delta.direction === 'neutral' && (
            <Minus className="size-3.5 stroke-[2.5]" aria-hidden="true" />
          )}
          <span>{delta.value}</span>
        </div>
      )}
    </div>
  );
}

export interface HeaderMetricGroupProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function HeaderMetricGroup({
  children,
  className,
  id,
}: HeaderMetricGroupProps) {
  return (
    <div
      id={id}
      className={cn(
        "flex flex-wrap items-center gap-6 md:gap-8",
        className
      )}
    >
      {children}
    </div>
  );
}

export default HeaderMetric;
