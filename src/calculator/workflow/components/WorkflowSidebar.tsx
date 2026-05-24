import React from 'react';
import { QuoteWorkflowState } from '../types';
import { useRealtimeWorkflow } from '../hooks/useRealtimeWorkflow';
import { cn } from '@/lib/utils';
import { 
  DollarSign, 
  Percent, 
  MapPin, 
  ShieldAlert, 
  CheckCircle2, 
  CloudLightning, 
  Clock 
} from 'lucide-react';

interface WorkflowSidebarProps {
  state: QuoteWorkflowState;
  lastSavedTime?: string;
}

export function WorkflowSidebar({ state, lastSavedTime }: WorkflowSidebarProps) {
  const { breakdown, yields, viability, risk, decision, alerts } = useRealtimeWorkflow(state);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'LOW': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'MEDIUM': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'HIGH': return 'text-rose-600 bg-rose-50 border-rose-200';
      case 'MAXIMUM_CRITICAL': return 'text-red-700 bg-red-100 border-red-300';
      default: return 'text-gray-400 bg-gray-50';
    }
  };

  const getViabilityColor = (classification: string) => {
    switch (classification) {
      case 'OUTSTANDING': return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      case 'VIABLE': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'WARNING': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'UNVIABLE': return 'text-rose-600 bg-rose-50 border-rose-200';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-[28px] p-6 space-y-6 shadow-sm sticky top-6">
      {/* Live Financial Header */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Sinal de Saída Live</span>
          {lastSavedTime && (
            <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold">
              <Clock className="size-3" />
              Auto-salvo {lastSavedTime}
            </div>
          )}
        </div>
        <div className="p-5.5 bg-gray-50 border border-gray-100 rounded-2xl relative overflow-hidden space-y-1">
          <span className="text-xs text-gray-500 font-semibold block">Preço Final Recomendado</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-black">R$ {breakdown.suggestedPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="text-xs font-bold text-gray-400">bruto</span>
          </div>
          {/* Subtle background color bar indicating net yield healthy/unhealthy levels */}
          <div className="absolute right-0 top-0 bottom-0 w-2.5 bg-gradient-to-b from-indigo-500 to-purple-500" />
        </div>
      </div>

      {/* Margem e Lucro Real Scorecard */}
      <div className="grid grid-cols-2 gap-3.5">
        <div className="border border-gray-100 rounded-2xl p-4 space-y-1.5">
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block leading-none">Margem Líquida</span>
          <div className="flex items-center gap-1">
            <Percent className="size-3.5 text-indigo-500 flex-shrink-0" />
            <span className="text-lg font-black text-black">{yields.netMarginPercent}%</span>
          </div>
          <span className="text-[10px] text-gray-400 font-bold block">
            Meta: {state.customMargin}%
          </span>
        </div>

        <div className="border border-gray-100 rounded-2xl p-4 space-y-1.5">
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block leading-none">Lucro Residual</span>
          <div className="flex items-center gap-1">
            <DollarSign className="size-3.5 text-emerald-500 flex-shrink-0" />
            <span className="text-lg font-black text-black">R$ {yields.actualNetProfitAmount.toFixed(0)}</span>
          </div>
          <span className="text-[10px] text-gray-400 font-bold block">
            Lucro real livre
          </span>
        </div>
      </div>

      {/* Status Badges Section */}
      <div className="space-y-3.5">
        <div className="space-y-1.5">
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block leading-none">Classificação de Viabilidade</span>
          <div className={cn("px-4 py-2.5 rounded-xl border font-bold text-xs flex justify-between items-center transition-all", getViabilityColor(viability.classification))}>
            <span>Viabilidade: {viability.classification}</span>
            <span className="text-[10px] bg-white border border-black/10 text-black px-1.5 py-0.5 rounded-md font-black">{viability.score} pts</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block leading-none">Perfil de Risco Operacional</span>
          <div className={cn("px-4 py-2.5 rounded-xl border font-bold text-xs flex justify-between items-center transition-all", getRiskColor(risk.overallRiskLevel))}>
            <span>Grau: {risk.overallRiskLevel}</span>
            <span className="text-[10px] font-medium leading-none">Padrão DDSulf</span>
          </div>
          {risk.marginDeteriorationProbabilityPercent > 30 && (
            <span className="text-[10px] text-rose-500 font-bold block text-right mt-1 leading-none">
              Probabilidade de desvio de margem: {risk.marginDeteriorationProbabilityPercent}%
            </span>
          )}
        </div>
      </div>

      {/* Break-Even threshold Pricing */}
      <div className="border border-gray-100 rounded-2xl p-4 space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block leading-none">Break-Even (Piso Zero)</span>
          <span className="text-[10px] bg-rose-500/10 border border-rose-500/20 text-rose-600 px-1.5 py-0.5 rounded-md font-medium">Risco operacional</span>
        </div>
        <div className="text-base font-extrabold text-gray-900">
          R$ {yields.breakEvenThresholdPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <p className="text-[10px] text-gray-400 font-semibold leading-relaxed">
          Preço mínimo abaixo do qual o rateio administrativo e impostos causam prejuízo real líquido.
        </p>
      </div>

      {/* Actionable Decision support */}
      <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-2">
        <span className="text-[9px] font-black text-indigo-700 uppercase tracking-widest block leading-none">Sugestão Técnica</span>
        <h4 className="text-xs font-black text-indigo-950">{decision.suggestedAction}</h4>
        <p className="text-[11px] text-indigo-850 font-medium leading-relaxed leading-3">
          {decision.rationale}
        </p>
      </div>
    </div>
  );
}
