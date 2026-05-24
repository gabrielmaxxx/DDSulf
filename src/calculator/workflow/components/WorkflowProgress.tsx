import React from 'react';
import { CurrentStepIndex } from '../types';
import { useQuoteSteps } from '../hooks/useQuoteSteps';
import { cn } from '@/lib/utils';

interface WorkflowProgressProps {
  currentStep: CurrentStepIndex;
  maxStepReached: number;
  onStepClick: (step: CurrentStepIndex) => void;
}

export function WorkflowProgress({ currentStep, maxStepReached, onStepClick }: WorkflowProgressProps) {
  const { steps, progressPercent, categorisedGroups } = useQuoteSteps(currentStep);

  return (
    <div className="space-y-4">
      {/* Category Labels bar */}
      <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
        {Object.entries(categorisedGroups).map(([catReg, val]) => {
          const isCurrentCat = currentStep >= val.start && currentStep <= val.end;
          return (
            <span
              key={catReg}
              className={cn(
                "transition-colors",
                isCurrentCat ? "text-indigo-600 font-extrabold" : "text-gray-400"
              )}
            >
              {val.label}
            </span>
          );
        })}
      </div>

      {/* Progress Bar Container */}
      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden relative">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Step Indicators Circular Buttons - Horizontal Scrolling on Mobile */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-between">
        {steps.map(s => {
          const isCurrent = s.number === currentStep;
          const isCompleted = s.number < currentStep || s.number <= maxStepReached;
          const isInteractable = s.number <= maxStepReached;

          return (
            <button
              key={s.number}
              onClick={() => isInteractable && onStepClick(s.number as CurrentStepIndex)}
              disabled={!isInteractable}
              className={cn(
                "relative flex-shrink-0 size-8 rounded-xl font-bold text-xs flex items-center justify-center border-2 transition-all transition-duration-200 select-none",
                isCurrent 
                  ? "bg-black border-black text-white ring-4 ring-black/10 scale-110" 
                  : isCompleted 
                    ? "bg-indigo-50 border-indigo-400 text-indigo-700 hover:bg-indigo-100 cursor-pointer" 
                    : "bg-white border-gray-200 text-gray-400 cursor-not-allowed"
              )}
              title={`${s.title}: ${s.subtitle}`}
            >
              {s.number}
              {isCompleted && !isCurrent && (
                <span className="absolute -top-1 -right-1 size-2 bg-indigo-500 rounded-full border border-white" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
