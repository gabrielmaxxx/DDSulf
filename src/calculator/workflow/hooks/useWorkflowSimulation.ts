import { useMemo } from 'react';
import { QuoteWorkflowState } from '../types';
import { simulationService } from '../services/simulationService';
import { PricingBreakdown } from '../../types';

export function useWorkflowSimulation(state: QuoteWorkflowState, breakdown: PricingBreakdown) {
  return useMemo(() => {
    return simulationService.simulateScenarios(state, breakdown);
  }, [state, breakdown]);
}
