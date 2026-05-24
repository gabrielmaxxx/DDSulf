import React from 'react';
import { Sparkles, HelpCircle, ShieldAlert, Award, TrendingUp, Cpu, Info } from 'lucide-react';

// 1. Cost Breakdown Visual split
interface CostBreakdownProps {
  chemicalCost: number;
  laborCost: number;
  travelCost: number;
}

export function CostBreakdown({ chemicalCost, laborCost, travelCost }: CostBreakdownProps) {
  const total = chemicalCost + laborCost + travelCost;
  const chemPct = total > 0 ? (chemicalCost / total) * 100 : 0;
  const laborPct = total > 0 ? (laborCost / total) * 100 : 0;
  const travelPct = total > 0 ? (travelCost / total) * 100 : 0;

  return (
    <div className="space-y-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/50">
      <div className="flex justify-between items-center">
        <h4 className="text-xs font-bold text-slate-900 tracking-tight uppercase">Divisão de Custos do Serviço</h4>
        <span className="text-[10px] font-mono text-slate-500 font-bold">Total: {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
      </div>

      {/* Stacked Percentage split bar design */}
      <div className="h-2 rounded-full overflow-hidden flex bg-slate-100">
        <div style={{ width: `${chemPct}%` }} className="h-full bg-slate-900 transition-all duration-300" title="Químicos" />
        <div style={{ width: `${laborPct}%` }} className="h-full bg-slate-400 transition-all duration-300" title="Mão de Obra" />
        <div style={{ width: `${travelPct}%` }} className="h-full bg-amber-500 transition-all duration-300" title="Deslocamento" />
      </div>

      {/* Legend list */}
      <div className="grid grid-cols-3 gap-2 text-[10px] font-sans font-medium">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-slate-900" />
            <span className="text-slate-500 block">Ativos Químicos</span>
          </div>
          <span className="font-bold text-slate-900 font-mono pl-2.5">{chemicalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
        </div>
        
        <div className="space-y-0.5">
          <div className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-slate-400" />
            <span className="text-slate-500 block">Equipe Técnica</span>
          </div>
          <span className="font-bold text-slate-900 font-mono pl-2.5">{laborCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-amber-500" />
            <span className="text-slate-500 block">Translado (Km)</span>
          </div>
          <span className="font-bold text-slate-900 font-mono pl-2.5">{travelCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
        </div>
      </div>
    </div>
  );
}

// 2. Interactive Pricing Summary Card
interface PricingCardProps {
  suggestedPrice: number;
  estimatedCost: number;
  estimatedMargin: number;
  timeHours: number;
  teamSize: number;
  onApprove?: () => void;
  isLoading?: boolean;
}

export function PricingCard({
  suggestedPrice,
  estimatedCost,
  estimatedMargin,
  timeHours,
  teamSize,
  onApprove,
  isLoading
}: PricingCardProps) {
  const isHealthyMargin = estimatedMargin >= 50;

  return (
    <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-6 shadow-sm relative overflow-hidden">
      {/* Visual dynamic badge overlay */}
      <div className="absolute right-0 top-0 bg-slate-900 text-white text-[9px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-bl-xl font-mono flex items-center gap-1">
        <Cpu className="size-3 text-amber-500" />
        Preço Sugerido
      </div>

      <div className="space-y-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Orçamento Total Sugerido</span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tracking-tight">
          {suggestedPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2">
        <div className="space-y-0.5">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Margem Bruta Estimada</span>
          <div className="flex items-center gap-1">
            <span className={`text-base font-black font-mono ${isHealthyMargin ? 'text-emerald-600' : 'text-amber-500'}`}>
              {estimatedMargin}%
            </span>
            <span className="text-[9px] font-bold text-slate-400">lucro líquido</span>
          </div>
        </div>

        <div className="space-y-0.5">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Custo Operacional</span>
          <span className="text-base font-bold text-slate-800 font-mono block">
            {estimatedCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-4 flex justify-between text-xs font-sans text-slate-500 font-medium">
        <div className="flex items-center gap-1">
          <span className="font-bold text-slate-900">{timeHours} horas</span> de duração
        </div>
        <div className="flex items-center gap-1">
          Equipe de <span className="font-bold text-slate-900">{teamSize} técnicos</span>
        </div>
      </div>

      {onApprove && (
        <button
          onClick={onApprove}
          disabled={isLoading}
          className="w-full h-10 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold leading-none select-none transition-all flex items-center justify-center gap-2 cursor-pointer border border-transparent hover:border-slate-800"
        >
          {isLoading ? (
            <span>Processando Orçamento...</span>
          ) : (
            <React.Fragment>
              <Award className="size-4 text-amber-500" />
              <span>Gerar Proposta Oficial</span>
            </React.Fragment>
          )}
        </button>
      )}
    </div>
  );
}
