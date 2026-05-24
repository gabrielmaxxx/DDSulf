import React from 'react';
import { GitCompare, Sparkles, X, Plus } from 'lucide-react';
import { PricingSimulation } from '../types';

interface SimulationPanelProps {
  scenarios: PricingSimulation[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onAddCurrent: (name: string) => void;
  currentName: string;
  setCurrentName: (name: string) => void;
  isAddDisabled: boolean;
}

export function SimulationPanel({
  scenarios,
  onRemove,
  onClear,
  onAddCurrent,
  currentName,
  setCurrentName,
  isAddDisabled
}: SimulationPanelProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentName.trim()) return;
    onAddCurrent(currentName.trim());
    setCurrentName('');
  };

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-[32px] p-6 space-y-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <label className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-1.5">
            Mosaico de Simulações Comparativas <GitCompare className="size-4" />
          </label>
          <span className="text-[10px] text-[#9CA3AF] block">Compare até 4 estruturas paralelas de custos</span>
        </div>
        {scenarios.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-[10px] font-bold text-rose-600 hover:text-rose-800 uppercase tracking-widest transition-colors"
          >
            Limpar
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="Apelido da simulação (Ex: Margem 70%, Dobro Químicos)"
          value={currentName}
          onChange={(e) => setCurrentName(e.target.value)}
          maxLength={30}
          className="flex-1 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl px-4 py-3 text-xs font-bold text-black placeholder:text-[#9CA3AF] focus:ring-1 focus:ring-black outline-none"
        />
        <button
          type="submit"
          disabled={isAddDisabled || !currentName.trim()}
          className="bg-black hover:bg-black/90 disabled:opacity-40 text-white rounded-2xl px-5 flex items-center justify-center transition-all"
          title="Salvar simulação para comparação"
        >
          <Plus className="size-4 shrink-0" />
        </button>
      </form>

      {scenarios.length === 0 ? (
        <div className="bg-gray-50/50 rounded-2xl p-6 text-center border border-dashed border-[#E5E7EB]">
          <GitCompare className="size-6 text-[#9CA3AF] mx-auto opacity-40 mb-2" />
          <span className="text-[10px] font-black uppercase tracking-widest text-[#9CA3AF] block">Nenhum snapshot salvo</span>
          <span className="text-[10px] text-[#9CA3AF] block mt-1">Dê um nome e clique em "+" para fixar e comparar cenários operacionais.</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {scenarios.map((sim) => {
            const isLoss = sim.breakdown.actualMarginPercent < 30;
            return (
              <div
                key={sim.id}
                className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-2xl p-4.5 relative space-y-3 shadow-2xs group animate-in zoom-in-95 duration-200"
              >
                <button
                  onClick={() => onRemove(sim.id)}
                  className="absolute top-2 right-2 p-1 text-[#9CA3AF] hover:text-black hover:bg-[#F3F4F6] rounded-full transition-all"
                >
                  <X className="size-3" />
                </button>

                <div>
                  <div className="text-[10px] font-black text-black uppercase tracking-wider truncate mr-4">
                    {sim.scenarioName}
                  </div>
                  <div className="text-[8px] font-bold text-[#9CA3AF] uppercase tracking-widest font-mono mt-0.5">
                    Salvo às {sim.timestamp}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E5E7EB]/70 space-y-1.5">
                  <div className="flex justify-between items-baseline text-[10px]">
                    <span className="text-[#6B7280]">Sugestão:</span>
                    <span className="font-black text-black">R$ {sim.breakdown.suggestedPrice}</span>
                  </div>
                  <div className="flex justify-between items-baseline text-[10px]">
                    <span className="text-[#6B7280]">Custo Op:</span>
                    <span className="font-semibold text-black">R$ {sim.breakdown.totalOperationalCost.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between items-baseline text-[10px]">
                    <span className="text-[#6B7280]">Margem:</span>
                    <span className={`font-black ${isLoss ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {sim.breakdown.actualMarginPercent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline text-[10px]">
                    <span className="text-[#6B7280]">Tempo Op:</span>
                    <span className="font-mono text-black font-semibold">{sim.breakdown.estimatedTimeHours.toFixed(1)}h</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
