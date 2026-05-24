import React from 'react';
import { Target, LayoutGrid, Maximize, AlertTriangle, Users, Truck, Zap, Calendar } from 'lucide-react';
import { PricingInputs } from '../types';

interface OperationalSummaryProps {
  inputs: PricingInputs;
  estimatedHours: number;
}

export function OperationalSummary({ inputs, estimatedHours }: OperationalSummaryProps) {
  const {
    pestType,
    environmentType,
    areaSize,
    infestationLevel,
    complexity,
    displacement,
    technicians,
    urgency,
    recurrence
  } = inputs;

  const dataTiles = [
    { label: 'Praga Alvo', val: pestType, icon: Target, color: 'text-[#111827]' },
    { label: 'Ambiente', val: environmentType, icon: LayoutGrid, color: 'text-[#111827]' },
    { label: 'Área Total', val: `${areaSize} m²`, icon: Maximize, color: 'text-[#111827]' },
    { label: 'Infestação', val: infestationLevel, icon: AlertTriangle, color: 'text-amber-600' },
    { label: 'Complexidade', val: complexity, icon: Zap, color: 'text-indigo-600' },
    { label: 'Distância Sede', val: `${displacement} Km`, icon: Truck, color: 'text-[#111827]' },
    { label: 'Equipe Alocada', val: `${technicians} Técnico(s)`, icon: Users, color: 'text-[#111827]' },
    { label: 'Urgência', val: urgency, icon: Zap, color: 'text-rose-600' },
    { label: 'Periodicidade', val: recurrence, icon: Calendar, color: 'text-[#111827]' }
  ];

  return (
    <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-[32px] p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.2em] block">
            Parâmetros de Serviço Ativos
          </span>
          <h4 className="text-sm font-black text-[#111827]">Ficha de Operação</h4>
        </div>
        <div className="text-right font-mono text-[10px] bg-white border border-[#E5E7EB] px-3 py-1.5 rounded-full text-black font-bold shadow-xs">
          Tempo Projetado: {estimatedHours.toFixed(1)}h
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
        {dataTiles.map((tile, idx) => (
          <div
            key={idx}
            className="bg-white border border-[#E5E7EB] rounded-2xl p-4 space-y-1 hover:shadow-xs transition-shadow duration-200"
          >
            <div className="flex items-center gap-2">
              <tile.icon className="size-3.5 text-[#9CA3AF]" />
              <span className="text-[9px] font-bold text-[#9CA3AF] uppercase tracking-wider block">
                {tile.label}
              </span>
            </div>
            <span className={`text-xs font-black block leading-tight ${tile.color}`}>
              {tile.val}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
