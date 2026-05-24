import React from 'react';
import { WorkflowSimulationResult } from '../services/simulationService';
import { Percent, TrendingUp, DollarSign, Swords } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SimulationPanelProps {
  scenarios: WorkflowSimulationResult[];
  onApplyScenario?: (margin: number) => void;
}

export function SimulationPanel({ scenarios, onApplyScenario }: SimulationPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Swords className="size-4.5 text-indigo-500" />
        <h3 className="text-sm font-black text-black uppercase tracking-wider">Combinações de Simulação Cruzada</h3>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed font-semibold">
        Compare composições logísticas, operacionais e de margem cruzada em tempo real para tomada de decisões comerciais em campo.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scenarios.map(sc => {
          const isBaseline = sc.id === 'current';

          return (
            <div
              key={sc.id}
              className={cn(
                "p-5 rounded-2xl border transition-all duration-200 select-none flex flex-col justify-between space-y-4",
                isBaseline 
                  ? "bg-black border-black text-white" 
                  : "bg-white border-gray-200 hover:border-gray-400 text-gray-900"
              )}
            >
              <div className="space-y-1">
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-wider block",
                  isBaseline ? "text-indigo-400" : "text-gray-400"
                )}>
                  {isBaseline ? 'Margem Proposta' : 'Fórmula de Simulação'}
                </span>
                <h4 className="text-xs font-black leading-tight">{sc.name}</h4>
                <p className={cn(
                  "text-[10px] font-medium leading-relaxed",
                  isBaseline ? "text-gray-300" : "text-gray-500"
                )}>
                  {sc.desc}
                </p>
              </div>

              {/* Financial Comparisons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-black/10">
                <div>
                  <span className="text-[10px] opacity-60 block">Preço de Venda</span>
                  <span className="text-sm font-black">
                    R$ {sc.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] opacity-60 block">Margem Líquida</span>
                  <span className="text-sm font-black text-indigo-500 flex items-center gap-0.5">
                    {sc.margin}%
                    <TrendingUp className="size-3" />
                  </span>
                </div>
              </div>

              {/* Quick Actions buttons to apply target margin simulation values */}
              {!isBaseline && onApplyScenario && (
                <button
                  type="button"
                  onClick={() => onApplyScenario(sc.margin)}
                  className="w-full py-2 bg-gray-50 hover:bg-gray-150 border border-gray-200 text-black text-[10px] font-black rounded-xl uppercase tracking-wider transition-all"
                >
                  Modelar Esta Margem
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
