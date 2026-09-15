import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PropertyTypeOption {
  value: string;
  label: string;
  icon: LucideIcon;
  desc: string;
}

interface CalculatorStepEnvironmentProps {
  propertyType: string;
  setPropertyType: (propertyType: string) => void;
  propertyTypes: PropertyTypeOption[];
}

export function CalculatorStepEnvironment({
  propertyType,
  setPropertyType,
  propertyTypes
}: CalculatorStepEnvironmentProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h4 className="text-xl font-extrabold text-slate-800 tracking-tight">Qual o tipo de ambiente?</h4>
        <p className="text-xs text-slate-500">Selecione o enquadramento físico do local onde se dará o tratamento.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {propertyTypes.map((pt) => {
          const isSelected = propertyType === pt.value;
          const IconComp = pt.icon;
          return (
            <button
              key={pt.value}
              type="button"
              onClick={() => setPropertyType(pt.value)}
              className={`p-6 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-4.5 min-h-[120px] ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50/20 shadow-sm'
                  : 'border-slate-150 bg-white hover:border-slate-250 hover:shadow-xs'
              }`}
            >
              <div className={`p-3 rounded-xl border shrink-0 ${
                isSelected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-50 text-slate-400 border-slate-150'
              }`}>
                <IconComp className="size-5.5" />
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h5 className={`text-sm font-black uppercase ${isSelected ? 'text-[#1B3A2D]' : 'text-slate-800'}`}>
                    {pt.label}
                  </h5>
                  <span className={`size-3 rounded-full border-2 ${
                    isSelected ? 'border-emerald-600 bg-emerald-600' : 'border-slate-200'
                  }`} />
                </div>
                <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                  {pt.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
