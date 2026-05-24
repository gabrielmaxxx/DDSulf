import React from 'react';
import { ArrowDownRight, ArrowUpRight, Percent, DollarSign, TrendingUp, Sparkles, Calendar } from 'lucide-react';

// 1. Cost Card representation
interface CostCardProps {
  amount: number;
  category: string;
  type: string;
  date?: string;
  onClick?: () => void;
}

export function CostCard({ amount, category, type, date, onClick }: CostCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`p-4 rounded-2xl border border-slate-200/50 bg-white hover:border-slate-300 transition-all ${
        onClick ? 'cursor-pointer active:scale-[0.99]' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono">{type}</span>
          <h4 className="text-sm font-bold text-slate-800 tracking-tight leading-snug">{category}</h4>
          {date && (
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <Calendar className="size-3" />
              <span>{new Date(date).toLocaleDateString('pt-BR')}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 text-rose-600 font-mono text-xs font-bold bg-rose-50/50 px-2 py-0.5 rounded-lg border border-rose-100/50">
          <ArrowDownRight className="size-3.5" />
          <span>-{amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
        </div>
      </div>
    </div>
  );
}

// 2. Revenue Card representation
interface RevenueCardProps {
  amount: number;
  category: string;
  client?: string;
  date?: string;
  onClick?: () => void;
}

export function RevenueCard({ amount, category, client, date, onClick }: RevenueCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`p-4 rounded-2xl border border-slate-200/50 bg-white hover:border-slate-300 transition-all ${
        onClick ? 'cursor-pointer active:scale-[0.99]' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono">{category}</span>
          <h4 className="text-sm font-bold text-slate-800 tracking-tight leading-snug">{client || 'Faturamento Direto'}</h4>
          {date && (
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <Calendar className="size-3" />
              <span>{new Date(date).toLocaleDateString('pt-BR')}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 text-emerald-600 font-mono text-xs font-bold bg-emerald-50/50 px-2 py-0.5 rounded-lg border border-emerald-100/50">
          <ArrowUpRight className="size-3.5" />
          <span>+{amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
        </div>
      </div>
    </div>
  );
}

// 3. Margin Card with contextual indicators changing color based on performance targets
interface MarginCardProps {
  marginPercent: number;
  netMarginValue: number;
}

export function MarginCard({ marginPercent, netMarginValue }: MarginCardProps) {
  const isHealthy = marginPercent >= 50;
  const isWarning = marginPercent >= 30 && marginPercent < 50;

  return (
    <div className={`p-5 rounded-3xl border transition-all ${
      isHealthy 
        ? 'bg-emerald-950/20 border-emerald-200/50 text-emerald-900' 
        : isWarning 
          ? 'bg-amber-50/50 border-amber-200/50 text-amber-900' 
          : 'bg-rose-50/50 border-rose-200/50 text-rose-900'
    }`}>
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <span className="text-[10px] font-bold tracking-wider uppercase opacity-75">Margem Operacional Líquida</span>
          <div className="flex items-baseline gap-1.5">
            <h3 className="text-2xl font-black tracking-tight font-mono">{marginPercent}%</h3>
            <span className="text-xs font-medium opacity-80">de lucro</span>
          </div>
        </div>
        <div className={`size-10 rounded-2xl flex items-center justify-center shrink-0 border ${
          isHealthy 
            ? 'bg-emerald-500/10 border-emerald-300/30 text-emerald-600' 
            : isWarning 
              ? 'bg-amber-500/10 border-amber-300/30 text-amber-600' 
              : 'bg-rose-500/10 border-rose-300/30 text-rose-600'
        }`}>
          <Percent className="size-4.5" />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100/10 flex items-center justify-between text-xs font-medium">
        <span className="opacity-75">Saldo Líquido de Caixa:</span>
        <span className="font-bold font-mono">
          {netMarginValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </span>
      </div>
    </div>
  );
}

// 4. Financial Summary Display Panel
interface FinancialSummaryProps {
  revenues: number;
  costs: number;
  ebitda: number;
}

export function FinancialSummary({ revenues, costs, ebitda }: FinancialSummaryProps) {
  const surplus = revenues - costs;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
      {/* 2.1 Total Revenues Card */}
      <div className="bg-white rounded-2xl border border-slate-200/45 p-4 flex gap-4 items-center">
        <div className="size-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-800 shrink-0">
          <TrendingUp className="size-4.5" />
        </div>
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none block">Faturamento Global</span>
          <span className="text-base font-black text-slate-900 font-mono tracking-tight block">
            {revenues.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </div>
      </div>

      {/* 2.2 Total Costs Card */}
      <div className="bg-white rounded-2xl border border-slate-200/45 p-4 flex gap-4 items-center">
        <div className="size-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-rose-600 shrink-0">
          <ArrowDownRight className="size-4.5" />
        </div>
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none block">Despesas Totais</span>
          <span className="text-base font-black text-slate-900 font-mono tracking-tight block">
            {costs.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </div>
      </div>

      {/* 2.3 EBITDA Adjustment Card */}
      <div className="bg-slate-900 rounded-2xl border border-slate-850 p-4 flex gap-4 items-center shadow-lg shadow-slate-900/5">
        <div className="size-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
          <Sparkles className="size-4.5" />
        </div>
        <div className="space-y-0.5 text-white">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none block">EBITDA Calibrado</span>
          <span className="text-base font-black font-mono tracking-tight text-white block">
            {ebitda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </div>
      </div>
    </div>
  );
}
