import React from 'react';
import { Minus, Plus, Search, HelpCircle } from 'lucide-react';

// 1. Step Indicator for Multi-step proposals
interface StepFormIndicatorProps {
  currentStep: number;
  steps: string[];
}

export function StepFormIndicator({ currentStep, steps }: StepFormIndicatorProps) {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between">
        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isActive = currentStep === stepNum;
          const isCompleted = currentStep > stepNum;

          return (
            <React.Fragment key={step}>
              {/* Step circle */}
              <div className="flex flex-col items-center gap-1.5 relative z-10">
                <div 
                  className={`size-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border ${
                    isActive 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                      : isCompleted 
                        ? 'bg-emerald-500 text-white border-emerald-500' 
                        : 'bg-white text-slate-400 border-slate-200'
                  }`}
                >
                  {isCompleted ? '✓' : stepNum}
                </div>
                <span className={`text-[10px] font-medium tracking-tight whitespace-nowrap hidden sm:inline ${
                  isActive ? 'text-slate-900 font-bold' : 'text-slate-400'
                }`}>
                  {step}
                </span>
              </div>

              {/* Connecting line */}
              {idx < steps.length - 1 && (
                <div className="flex-1 h-[2px] bg-slate-100 mx-1 sm:mx-4 relative -translate-y-3.5">
                  <div 
                    className="h-full bg-slate-900 transition-all duration-300"
                    style={{ width: isCompleted ? '100%' : '0%' }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// 2. Currency Input formatted for BRL values
interface CurrencyInputProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  placeholder?: string;
  error?: string;
}

export function CurrencyInput({ label, value, onChange, placeholder = '0,00', error }: CurrencyInputProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    const num = raw ? parseFloat(raw) / 100 : 0;
    onChange(num);
  };

  const formattedValue = value ? value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '';

  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">{label}</label>
      <div className="relative rounded-xl border border-slate-200 bg-white focus-within:border-slate-900 focus-within:ring-1 focus-within:ring-slate-900 transition-all flex items-center overflow-hidden h-10 px-3">
        <span className="text-slate-400 text-xs font-semibold mr-1.5 shrink-0 select-none">R$</span>
        <input 
          type="text"
          value={formattedValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm font-semibold text-slate-900 focus:outline-none placeholder:text-slate-300"
        />
      </div>
      {error && <span className="text-[10px] text-rose-500 font-medium px-1 block">{error}</span>}
    </div>
  );
}

// 3. Percentage Input Controller
interface PercentageInputProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  max?: number;
}

export function PercentageInput({ label, value, onChange, max = 100 }: PercentageInputProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">{label}</label>
        <span className="font-mono text-xs font-bold text-slate-900">{value}%</span>
      </div>
      <input 
        type="range"
        min="0"
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900"
      />
    </div>
  );
}

// 4. Quantity Input increment/decrement controller
interface QuantityInputProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  suffix?: string;
}

export function QuantityInput({ label, value, onChange, min = 1, max = 999, suffix }: QuantityInputProps) {
  const increment = () => {
    if (value < max) onChange(value + 1);
  };

  const decrement = () => {
    if (value > min) onChange(value - 1);
  };

  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">{label}</label>
      <div className="flex items-center h-10 border border-slate-200 bg-white rounded-xl overflow-hidden px-1 w-fit">
        <button 
          type="button"
          onClick={decrement}
          disabled={value <= min}
          className="size-8 rounded-lg flex items-center justify-center hover:bg-slate-50 cursor-pointer disabled:opacity-40 transition-all text-slate-600"
        >
          <Minus className="size-3.5" />
        </button>
        <div className="px-3 min-w-[48px] text-center select-none font-sans">
          <span className="text-sm font-bold text-slate-900">{value}</span>
          {suffix && <span className="text-[10px] text-slate-400 font-semibold ml-0.5">{suffix}</span>}
        </div>
        <button 
          type="button"
          onClick={increment}
          disabled={value >= max}
          className="size-8 rounded-lg flex items-center justify-center hover:bg-slate-50 cursor-pointer disabled:opacity-40 transition-all text-slate-600"
        >
          <Plus className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
