import React from 'react';
import { Beaker, Check } from 'lucide-react';

interface PestOption {
  value: string;
  label: string;
  defaultService: string;
}

interface ServiceOption {
  value: string;
  label: string;
}

interface CalculatorStepServiceProps {
  pestType: string;
  setPestType: (pest: string) => void;
  serviceType: string;
  setServiceType: (service: string) => void;
  pestsList: PestOption[];
  servicesList: ServiceOption[];
}

export function CalculatorStepService({
  pestType,
  setPestType,
  serviceType,
  setServiceType,
  pestsList,
  servicesList
}: CalculatorStepServiceProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h4 className="text-xl font-extrabold text-slate-800 tracking-tight">Qual serviço será realizado?</h4>
        <p className="text-xs text-slate-500">Selecione o procedimento de controle de pragas sanitário correspondente.</p>
      </div>

      {/* Grid de pragas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pestsList.map((p) => {
          const isSelected = pestType === p.value;
          return (
            <button
              key={p.value}
              type="button"
              onClick={() => {
                setPestType(p.value);
                setServiceType(p.defaultService);
              }}
              className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-[115px] group ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50/20 shadow-xs'
                  : 'border-slate-150 bg-white hover:border-slate-250'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className={`p-2 rounded-xl border ${
                  isSelected 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-slate-50 text-slate-400 border-slate-150 group-hover:bg-slate-100 group-hover:text-slate-700'
                }`}>
                  <Beaker className="size-4" />
                </div>
                <div className={`size-4 rounded-full border-2 flex items-center justify-center transition-all ${
                  isSelected 
                    ? 'border-emerald-600 bg-emerald-600 text-white' 
                    : 'border-slate-200'
                }`}>
                  {isSelected && <Check className="size-2.5 stroke-[4px]" />}
                </div>
              </div>
              <span className={`text-xs font-black uppercase tracking-tight mt-3 ${isSelected ? 'text-[#1B3A2D]' : 'text-slate-800'}`}>
                {p.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Advanced details config box */}
      <div className="p-4 bg-slate-50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-700">Ajuste Manual da Tecnologia de Serviço (Opcional):</p>
          <p className="text-[11px] text-slate-500 font-medium">A alteração da tecnologia impactará as taxas e o rateio operacional.</p>
        </div>

        <select
          value={serviceType}
          onChange={(e) => setServiceType(e.target.value)}
          className="px-3.5 py-2 bg-white border border-slate-200 focus:border-emerald-400 rounded-xl text-xs font-bold text-slate-700 focus:outline-none shadow-xs"
        >
          {servicesList.map((srv) => (
            <option key={srv.value} value={srv.value}>{srv.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
