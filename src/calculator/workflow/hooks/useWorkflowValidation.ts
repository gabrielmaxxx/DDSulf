import { useMemo } from 'react';
import { QuoteWorkflowState } from '../types';
import { validationService } from '../services/validationService';

export function useWorkflowValidation(currentStep: number, state: QuoteWorkflowState) {
  return useMemo(() => {
    return validationService.validateStep(currentStep, state);
  }, [currentStep, state]);
}
