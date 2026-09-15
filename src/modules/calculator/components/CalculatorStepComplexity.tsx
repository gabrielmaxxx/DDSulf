import React from 'react';
import { InfestationLevel, OperationalComplexity } from '@/types/database';

interface ComplexityLevelOption {
  value: string;
  label: string;
  desc: string;
  status: string;
  comp: string;
}

interface CalculatorStepComplexityProps {
  selectedComplexityLevel: string;
  setSelectedComplexityLevel: (level: string) => void;
  setInfestationLevel: (status: InfestationLevel) => void;
  setComplexity: (comp: OperationalComplexity) => void;
  complexityLevels: ComplexityLevelOption[];
}

export function CalculatorStepComplexity({
  selectedComplexityLevel,
  setSelectedComplexityLevel,
  setInfestationLevel,
  setComplexity,
  complexityLevels
}: CalculatorStepComplexityProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h4 className="text-xl font-extrabold text-slate-800 tracking-tight">Qual o nível de complexidade?</h4>
        <p className="text-xs text-slate-500">Determine as condições do local e focos infestados relatados.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {complexityLevels.map((lvl) => {
          const isSelected = selectedComplexityLevel === lvl.value;
          return (
            <button
              key={lvl.value}
              type="button"
              onClick={() => {
                setSelectedComplexityLevel(lvl.value);
                setInfestationLevel(lvl.status as InfestationLevel);
                setComplexity(lvl.comp as OperationalComplexity);
              }}
              className={`p-6 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50/25 shadow-xs'
                  : 'border-slate-150 bg-white hover:border-slate-250'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`size-10 rounded-full flex items-center justify-center border font-mono font-black text-xs ${
                  isSelected 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                    : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}>
                  {lvl.value.charAt(0)}
                </div>
                <div>
                  <h5 className={`text-sm font-black uppercase ${isSelected ? 'text-[#1B3A2D]' : 'text-slate-800'}`}>
                    {lvl.label}
                  </h5>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">{lvl.desc}</p>
                </div>
              </div>

              <div className={`size-4 rounded-full border-2 flex items-center justify-center ${
                isSelected ? 'border-emerald-600 bg-emerald-600' : 'border-slate-200'
              }`} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
