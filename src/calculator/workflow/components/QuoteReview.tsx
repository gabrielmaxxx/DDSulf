import React from 'react';
import { QuoteWorkflowState } from '../types';
import { useRealtimeWorkflow } from '../hooks/useRealtimeWorkflow';
import { DollarSign, ShieldCheck, Map, Truck, Activity, Percent } from 'lucide-react';

interface QuoteReviewProps {
  state: QuoteWorkflowState;
}

export function QuoteReview({ state }: QuoteReviewProps) {
  const { breakdown, yields, viability, risk, decision } = useRealtimeWorkflow(state);

  return (
    <div className="bg-white border border-gray-200 rounded-[28px] p-6 space-y-6 shadow-xs">
      <div className="border-b border-gray-100 pb-4 space-y-1">
        <h3 className="text-sm font-black text-black uppercase tracking-wider">Painel Comparativo de Custos & Ponderações</h3>
        <p className="text-xs text-gray-500 font-semibold leading-relaxed">
          Demonstrativo de faturamento bruto deduzido de insumos químicos, combustível, hora técnica de equipe e tributação.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cost metrics list */}
        <div className="space-y-4 border border-gray-100 rounded-2xl p-4 bg-gray-50/50">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block leading-none">Demonstrativo Operacional</span>
          
          <div className="space-y-3">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-gray-500">Mão de Obra de Campo (Técnicos)</span>
              <span className="text-gray-900">R$ {breakdown.directLaborCost.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-gray-500">Logística de Deslocação ({state.displacement} Km)</span>
              <span className="text-gray-900">R$ {breakdown.displacementCost.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-xs font-semibold">
              <span className="text-gray-500">Insumos Químicos Diretos (Calda)</span>
              <span className="text-gray-900">R$ {breakdown.chemicalsCost.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-xs font-semibold">
              <span className="text-gray-500">Depreciação de Equipamentos & EPIs</span>
              <span className="text-gray-900">R$ {breakdown.equipmentsCost.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-xs font-semibold">
              <span className="text-gray-500">Amortização de Custos Fixos (Overhead)</span>
              <span className="text-gray-900">R$ {breakdown.indirectOverheadCost.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-xs font-bold border-t border-gray-150 pt-2 text-indigo-700">
              <span>Custo Total Operacional Consolidado</span>
              <span>R$ {breakdown.totalOperationalCost.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Tributos, Faturamento e Retornos de Capital */}
        <div className="space-y-4 border border-gray-100 rounded-2xl p-4">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block leading-none">Simples Nacional & Impostos</span>
          
          <div className="space-y-3">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-gray-500">Tributação Federal Basal (Simples ~9%)</span>
              <span className="text-gray-900">R$ {(breakdown.suggestedPrice * 0.09).toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-xs font-semibold">
              <span className="text-gray-500">Taxa de Margem Pretendida</span>
              <span className="text-gray-900">{state.customMargin}%</span>
            </div>

            <div className="flex justify-between text-xs font-semibold">
              <span className="text-gray-500">Preço Técnico Equivalente Bruto</span>
              <span className="text-gray-900 font-bold">R$ {breakdown.suggestedPrice.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-xs font-bold border-t border-gray-150 pt-2 text-emerald-700">
              <span>Lucratividade Total Adquirida</span>
              <span>R$ {yields.actualNetProfitAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-150 flex items-center gap-2.5">
            <ShieldCheck className="size-4.5 text-emerald-600 flex-shrink-0" />
            <span className="text-[10px] font-semibold text-emerald-950">
              Orçamento livre de distorções químicas e amparado por break-even dinâmico.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
