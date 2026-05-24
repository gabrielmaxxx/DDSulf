import { useMemo } from 'react';
import { CurrentStepIndex, StepMetadata } from '../types';
import { METADATA_STEPS } from './useQuoteWorkflow';

export function useQuoteSteps(currentStep: CurrentStepIndex) {
  const steps: StepMetadata[] = METADATA_STEPS;

  const currentMetadata = useMemo(() => {
    return steps.find(s => s.number === currentStep) || steps[0];
  }, [currentStep, steps]);

  const progressPercent = useMemo(() => {
    return Math.round((currentStep / steps.length) * 100);
  }, [currentStep, steps.length]);

  const categorisedGroups = useMemo(() => {
    const groups: Record<string, { start: number; end: number; label: string }> = {
      'Cadastro': { start: 1, end: 1, label: 'Identificação' },
      'Operacional': { start: 2, end: 8, label: 'Operacional' },
      'Comercial': { start: 9, end: 9, label: 'Comercial' },
      'Finanças': { start: 10, end: 12, label: 'Viabilidade' },
      'Conclusão': { start: 13, end: 13, label: 'Conclusão' }
    };
    return groups;
  }, []);

  return {
    steps,
    currentMetadata,
    progressPercent,
    categorisedGroups
  };
}
