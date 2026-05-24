/**
 * Multi-step Mobile Work Wizard State Controller
 * Manages step traversal sequences, validation status flags, and local draft backup hooks.
 */

import { useState } from 'react';
import { MobileWorkflowStep } from '../types';

export function useMobileWorkflow<T>(initialSteps: Array<Omit<MobileWorkflowStep<Omit<T, any>>, 'data'>>, initialData: T) {
  const [data, setData] = useState<T>(initialData);
  const [steps, setSteps] = useState<Omit<MobileWorkflowStep<Omit<T, any>>, 'data'>[]>(initialSteps);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const activeStep = steps[activeStepIndex];

  const updateData = (updates: Partial<T> | ((prev: T) => T)) => {
    setData(prev => {
      const next = typeof updates === 'function' ? updates(prev) : { ...prev, ...updates };
      return next;
    });
  };

  const nextStep = () => {
    if (activeStepIndex < steps.length - 1) {
      // Mark current step completed in UI
      setSteps(prev => prev.map((s, idx) => idx === activeStepIndex ? { ...s, isCompleted: true } : s));
      setActiveStepIndex(prev => prev + 1);
    }
  };

  const previousStep = () => {
    if (activeStepIndex > 0) {
      setActiveStepIndex(prev => prev - 1);
    }
  };

  const jumpToStep = (index: number) => {
    if (index >= 0 && index < steps.length) {
      setActiveStepIndex(index);
    }
  };

  const isLastStep = activeStepIndex === steps.length - 1;
  const isFirstStep = activeStepIndex === 0;

  return {
    data,
    steps,
    activeStep,
    activeStepIndex,
    isFirstStep,
    isLastStep,
    updateData,
    nextStep,
    previousStep,
    jumpToStep
  };
}

export default useMobileWorkflow;
