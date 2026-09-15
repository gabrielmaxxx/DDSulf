import React from 'react';

interface CalculatorStepAreaProps {
  areaM2: number;
  setAreaM2: (area: number) => void;
}

const QUICK_AREA_BUTTONS = [50, 100, 200, 350, 500, 1000];

export function CalculatorStepArea({
  areaM2,
  setAreaM2
}: CalculatorStepAreaProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h4 className="text-xl font-extrabold text-slate-800 tracking-tight">Qual a área estimada?</h4>
        <p className="text-xs text-slate-500 font-semibold">Mapeie a extensão em metros quadrados para carregar os insumos adequados.</p>
      </div>

      <div className="bg-slate-50 border border-slate-150 p-8 rounded-3xl flex flex-col items-center justify-center space-y-4 max-w-lg mx-auto">
        <label className="text-xs font-bold text-[#1B3A2D] uppercase tracking-wide">Área total para tratamento</label>
        
        <div className="relative w-full max-w-xs">
          <input
            type="number"
            min="1"
            value={areaM2 || ''}
            onChange={(e) => setAreaM2(parseInt(e.target.value) || 0)}
            placeholder="Exemplo: 250"
            className="w-full text-center h-16 px-4 pr-14 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-300 font-mono text-2xl font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-xs"
          />
          <span className="absolute right-5 top-1/2 -translate-y-1/2 font-mono text-sm font-black text-slate-400">m²</span>
        </div>

        <p className="text-[11px] text-[#6B6B5F] text-center font-bold px-4">
          Utilizado para cálculo de insumos e mão de obra.
        </p>
      </div>

      {/* Quick helper area buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg mx-auto">
        {QUICK_AREA_BUTTONS.map(val => (
          <button
            key={val}
            type="button"
            onClick={() => setAreaM2(val)}
            className={`px-3 py-1.5 border rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              areaM2 === val 
                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300 font-extrabold shadow-2xs' 
                : 'bg-white hover:bg-slate-50 text-slate-500 border-slate-200'
            }`}
          >
            {val} m²
          </button>
        ))}
      </div>
    </div>
  );
}
