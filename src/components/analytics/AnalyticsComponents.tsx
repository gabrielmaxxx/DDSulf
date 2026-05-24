import React from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, AlertTriangle, ShieldCheck, LucideIcon, Sparkles } from 'lucide-react';

// 1. Core KPI Card with Trend comparison indicator
interface KPICardProps {
  title: string;
  value: string | number;
  change?: number; // percentage change value (+ or -)
  label?: string; // comparison text
  icon: LucideIcon;
  variant?: 'slate' | 'amber' | 'emerald' | 'rose';
}

export function KPICard({ 
  title, 
  value, 
  change, 
  label, 
  icon: IconComponent, 
  variant = 'slate' 
}: KPICardProps) {
  const isPositive = change && change > 0;
  
  const variantStyles = {
    slate: 'border-slate-200/50 bg-white text-slate-800',
    amber: 'border-amber-200/50 bg-amber-50/20 text-amber-900',
    emerald: 'border-emerald-200/50 bg-emerald-50/20 text-emerald-900',
    rose: 'border-rose-200/50 bg-rose-50/20 text-rose-900',
  };

  const iconBgStyles = {
    slate: 'bg-slate-50 border-slate-100 text-slate-600',
    amber: 'bg-amber-100/50 border-amber-200/50 text-amber-600',
    emerald: 'bg-emerald-100/50 border-emerald-200/50 text-emerald-600',
    rose: 'bg-rose-100/50 border-rose-200/50 text-rose-600',
  };

  return (
    <div className={`p-5 rounded-2xl border transition-all hover:shadow-md hover:shadow-slate-100/40 flex flex-col justify-between min-h-[120px] ${variantStyles[variant]}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block leading-none">{title}</span>
          <h3 className="text-xl sm:text-2xl font-black font-sans leading-none tracking-tight">{value}</h3>
        </div>
        <div className={`size-9 rounded-xl flex items-center justify-center shrink-0 border ${iconBgStyles[variant]}`}>
          <IconComponent className="size-4" />
        </div>
      </div>

      {change !== undefined && (
        <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-slate-100/50 text-[11px]">
          {isPositive ? (
            <span className="flex items-center gap-0.5 text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-lg border border-emerald-100/50 font-mono">
              <TrendingUp className="size-3" />
              <span>+{change}%</span>
            </span>
          ) : (
            <span className="flex items-center gap-0.5 text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded-lg border border-rose-100/50 font-mono">
              <TrendingDown className="size-3" />
              <span>{change}%</span>
            </span>
          )}
          {label && <span className="text-slate-400 font-medium">{label}</span>}
        </div>
      )}
    </div>
  );
}

// 2. Metric progress bar dashboard element
interface MetricCardProps {
  title: string;
  value: number;
  total: number;
  suffix?: string;
  colorClass?: string;
}

export function MetricCard({ title, value, total, suffix = '', colorClass = 'bg-slate-900' }: MetricCardProps) {
  const percentage = Math.min(100, total > 0 ? (value / total) * 100 : 0);

  return (
    <div className="p-4 bg-white border border-slate-200/45 rounded-2xl space-y-3.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{title}</span>
        <span className="text-xs font-black text-slate-900 font-mono">
          {value} / {total} {suffix}
        </span>
      </div>
      <div className="relative w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// 3. Natural Language algorithmic insight recommendation panel
interface InsightCardProps {
  type: string;
  pattern: string;
  confidence: number;
  dataPoints: number;
  onActionClick?: () => void;
}

export function InsightCard({ type, pattern, confidence, dataPoints, onActionClick }: InsightCardProps) {
  const isHighConfidence = confidence >= 0.85;

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-850 p-5 rounded-3xl relative overflow-hidden shadow-lg space-y-4">
      <div className="absolute -right-6 -bottom-6 size-24 bg-gradient-to-tr from-amber-500/10 to-amber-500/0 rounded-full blur-xl" />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 animate-pulse">
            <Sparkles className="size-4" />
          </div>
          <div>
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block font-mono">IA Insight</span>
            <span className="text-xs font-bold text-slate-100 block">{type}</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block font-mono">Fidedignidade</span>
          <span className="text-xs font-extrabold text-amber-400 font-mono">{(confidence * 100).toFixed(0)}%</span>
        </div>
      </div>

      <p className="text-slate-300 text-xs leading-relaxed font-normal">
        {pattern}
      </p>

      {onActionClick && (
        <button 
          onClick={onActionClick}
          className="w-full h-8 bg-white/10 hover:bg-white/15 transition-all text-white rounded-lg text-[10px] font-black tracking-wide uppercase flex items-center justify-center gap-1 cursor-pointer border border-white/5 active:scale-[0.99]"
        >
          Aplicar Recomendação
          <ArrowUpRight className="size-3 text-amber-400" />
        </button>
      )}
    </div>
  );
}
