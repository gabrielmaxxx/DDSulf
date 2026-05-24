import React from 'react';
import { DollarSign, Percent, TrendingUp, Info } from 'lucide-react';
import { PricingBreakdown } from '../types';

interface FinancialSummaryProps {
  breakdown: PricingBreakdown;
  recurrence: string;
}

export function FinancialSummary({ breakdown, recurrence }: FinancialSummaryProps) {
  const { suggestedPrice, totalOperationalCost, profitAmount, actualMarginPercent } = breakdown;

  const cards = [
    {
      label: 'Valor de Venda',
      value: `R$ ${suggestedPrice.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-black bg-gray-50',
      description: 'Preço sugerido consolidado'
    },
    {
      label: 'Custo Operacional',
      value: `R$ ${totalOperationalCost.toFixed(2)}`,
      icon: Percent,
      color: 'text-[#6B7280] bg-gray-50',
      description: 'Somatório de insumos + rotas'
    },
    {
      label: 'Lucro Líquido Esperado',
      value: `R$ ${profitAmount.toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-emerald-700 bg-emerald-50/50',
      description: `Margem projetada de ${actualMarginPercent.toFixed(1)}%`
    }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4.5">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className={`rounded-2xl p-5 border border-[#E5E7EB] space-y-2 hover:border-[#9CA3AF] transition-all ${card.color}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider block">
                {card.label}
              </span>
              <card.icon className="size-4 opacity-50 text-black" />
            </div>
            <div className="text-xl font-black block tracking-tight">
              {card.value}
            </div>
            <p className="text-[9px] text-[#9CA3AF] font-medium leading-none block">
              {card.description}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex gap-3 text-left">
        <Info className="size-4.5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="text-xs font-black text-blue-950 uppercase tracking-wide block">Auditoria de Lucratividade Operacional</span>
          <p className="text-xs text-blue-800 leading-relaxed">
            Este orçamento foi estruturado com base em custos logísticos locais. Para maximizar o faturamento anual em contratos de modalidade <strong>{recurrence}</strong>, consolide a rota regional diminuindo o custo de quilometragem.
          </p>
        </div>
      </div>
    </div>
  );
}
