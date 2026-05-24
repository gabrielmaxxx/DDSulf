import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, HelpCircle } from 'lucide-react';

interface MarginDisplayProps {
  actualMargin: number;
  suggestedPrice: number;
  totalCost: number;
  customMargin: number;
  setCustomMargin: (margin: number) => void;
  targetMarginDefault?: number;
}

export function MarginDisplay({
  actualMargin,
  suggestedPrice,
  totalCost,
  customMargin,
  setCustomMargin,
  targetMarginDefault = 60
}: MarginDisplayProps) {
  // Determine color theme based on healthy threshold
  const isHealthy = actualMargin >= 50;
  const isCritical = actualMargin < 35;

  const colorClass = isCritical
    ? 'text-rose-600'
    : isHealthy
    ? 'text-emerald-600'
    : 'text-amber-600';

  const barColor = isCritical
    ? 'bg-rose-500'
    : isHealthy
    ? 'bg-emerald-500'
    : 'bg-amber-500';

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 space-y-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.2em] block">
            Margem Bruta Estimada
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-4xl font-black ${colorClass}`}>
              {actualMargin.toFixed(1)}%
            </span>
            <span className="text-[#6B7280] text-xs font-bold">líquida</span>
          </div>
        </div>
        <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-3 text-right">
          <span className="text-[9px] font-bold text-[#9CA3AF] uppercase tracking-wider block">Lucro Projetado</span>
          <span className="text-lg font-black text-black">
            R$ {(suggestedPrice - totalCost).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Visual Bar */}
      <div className="space-y-2">
        <div className="h-2.5 w-full bg-[#F3F4F6] rounded-full overflow-hidden relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, Math.max(0, actualMargin))}%` }}
            className={`h-full rounded-full ${barColor}`}
            transition={{ type: 'spring', stiffness: 80 }}
          />
          {/* Target marker */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-black z-10"
            style={{ left: `${targetMarginDefault}%` }}
            title="Alvo Recomendado"
          />
        </div>
        <div className="flex justify-between text-[9px] font-black text-[#9CA3AF] uppercase tracking-widest">
          <span>Piso (30%)</span>
          <span className="text-black">Alvo ({targetMarginDefault}%)</span>
          <span>Excelente (75%)</span>
        </div>
      </div>

      {/* Custom Margin Slider Configurator */}
      <div className="pt-4 border-t border-[#F3F4F6] space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-1">
            Simulador de Margem <Sparkles className="size-3.5 text-black" />
          </label>
          <span className="text-xs font-mono font-black text-black bg-[#F3F4F6] px-2.5 py-1 rounded-lg">
            {customMargin}%
          </span>
        </div>

        <input
          type="range"
          min="15"
          max="85"
          step="5"
          value={customMargin}
          onChange={(e) => setCustomMargin(Number(e.target.value))}
          className="w-full accent-black cursor-pointer h-1.5 rounded-lg"
        />

        <div className="flex gap-2.5 pt-1">
          {[35, 50, 60, 70, 75].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setCustomMargin(val)}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                customMargin === val
                  ? 'bg-black text-white border-black shadow-sm'
                  : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:border-black'
              }`}
            >
              {val}%
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
