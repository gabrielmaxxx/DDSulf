import React from 'react';
import { Truck, Users, Trash, Hammer, ShieldAlert } from 'lucide-react';
import { PricingBreakdown } from '../types';

interface CostBreakdownProps {
  breakdown: PricingBreakdown;
}

export function CostBreakdown({ breakdown }: CostBreakdownProps) {
  const {
    directLaborCost,
    displacementCost,
    chemicalsCost,
    indirectOverheadCost,
    equipmentsCost,
    totalOperationalCost
  } = breakdown;

  const costItems = [
    {
      name: 'Mão de Obra Direta',
      amount: directLaborCost,
      icon: Users,
      desc: 'Tempo técnico alocado e salários',
      color: 'bg-indigo-500'
    },
    {
      name: 'Produtos Químicos',
      amount: chemicalsCost,
      icon: Trash,
      desc: 'Dosagem de praguicidas / defensivos',
      color: 'bg-emerald-500'
    },
    {
      name: 'Deslocamento & Combustível',
      amount: displacementCost,
      icon: Truck,
      desc: 'Quilometragem calculada ida/volta',
      color: 'bg-amber-500'
    },
    {
      name: 'Equipamentos (Amortização)',
      amount: equipmentsCost,
      icon: Hammer,
      desc: 'Desgaste e EPIs necessários',
      color: 'bg-blue-500'
    },
    {
      name: 'Custos Administrativos / Indiretos',
      amount: indirectOverheadCost,
      icon: ShieldAlert,
      desc: 'Overhead corporativo e seguros',
      color: 'bg-slate-500'
    }
  ];

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 space-y-6 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.2em]">
          Composição Operacional de Custos
        </span>
        <span className="text-xs font-mono font-black text-[#6B7280]">
          Total: R$ {totalOperationalCost.toFixed(2)}
        </span>
      </div>

      <div className="space-y-4">
        {costItems.map((item, idx) => {
          const ratio = totalOperationalCost > 0 ? (item.amount / totalOperationalCost) * 100 : 0;
          
          return (
            <div key={idx} className="space-y-1.5 Group">
              <div className="flex items-center justify-between text-xs font-bold text-black">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-[#F3F4F6] rounded-lg group-hover:bg-black group-hover:text-white transition-colors duration-200">
                    <item.icon className="size-3.5 text-black" />
                  </div>
                  <div>
                    <span className="font-semibold block">{item.name}</span>
                    <span className="text-[10px] font-normal text-[#9CA3AF] block">{item.desc}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-semibold">R$ {item.amount.toFixed(2)}</span>
                  <span className="text-[10px] font-normal text-[#6B7280] block font-mono">{ratio.toFixed(1)}%</span>
                </div>
              </div>
              
              <div className="h-1.5 w-full bg-[#F3F4F6] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${item.color}`}
                  style={{ width: `${ratio}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-[#FAFAFA] rounded-2xl p-4 border border-[#E5E7EB] flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="text-[9px] font-black text-[#9CA3AF] uppercase tracking-wider block">Ponto de Equilíbrio (Break-Even)</span>
          <span className="text-[10px] text-[#6B7280]">Menor valor praticável sem perda de capital</span>
        </div>
        <div className="text-right">
          <span className="text-sm font-extrabold text-[#111827]">R$ {breakdown.breakEvenPrice.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
