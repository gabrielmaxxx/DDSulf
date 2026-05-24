import React from 'react';
import { Check } from 'lucide-react';

interface StepItem {
  number: number;
  label: string;
  desc: string;
}

interface PricingStepsProps {
  currentStep: number;
  setStep: (step: number) => void;
  steps: StepItem[];
}

export function PricingSteps({ currentStep, setStep, steps }: PricingStepsProps) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-6 border-b border-[#F3F4F6]">
      {steps.map((st, idx) => {
        const isCompleted = currentStep > st.number;
        const isActive = currentStep === st.number;
        
        return (
          <React.Fragment key={st.number}>
            <button
              onClick={() => {
                // Allow browsing backwards or to immediate next step for convenience
                if (st.number <= currentStep || isCompleted) {
                  setStep(st.number);
                }
              }}
              disabled={st.number > currentStep && !isCompleted}
              className="flex items-center gap-3.5 group text-left transition-all disabled:opacity-40"
            >
              <div
                className={`size-10 rounded-xl flex items-center justify-center font-black text-sm border transition-all ${
                  isCompleted
                    ? 'bg-black border-black text-white shadow-md'
                    : isActive
                    ? 'bg-white border-black text-black ring-2 ring-black/15 scale-105'
                    : 'bg-[#F9FAFB] border-[#E5E7EB] text-[#D1D5DB] group-hover:border-[#9CA3AF]'
                }`}
              >
                {isCompleted ? <Check className="size-4 stroke-[3px]" /> : st.number}
              </div>
              <div className="hidden sm:block">
                <span
                  className={`text-[10px] font-black uppercase tracking-[0.15em] block leading-tight ${
                    isActive ? 'text-black' : 'text-[#6B7280]'
                  }`}
                >
                  {st.label}
                </span>
                <span className="text-[10px] text-[#9CA3AF] font-bold block mt-0.5">
                  {st.desc}
                </span>
              </div>
            </button>
            {idx < steps.length - 1 && (
              <div className="hidden md:block h-px flex-1 bg-[#E5E7EB] mx-4" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
