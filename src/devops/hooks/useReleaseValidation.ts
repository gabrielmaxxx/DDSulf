/**
 * Hook to manage production pipeline validations, smoke checks and compliance scans.
 */

import { useState, useEffect } from 'react';
import { productionValidationService } from '../services/productionValidationService';
import { PipelineRun } from '../types';

export function useReleaseValidation() {
  const [pipelineRuns, setPipelineRuns] = useState<PipelineRun[]>([]);

  useEffect(() => {
    setPipelineRuns(productionValidationService.getPipelineRuns());
  }, []);

  const triggerValidationRun = (branch: string, env: 'production' | 'staging' | 'development') => {
    const freshRun = productionValidationService.triggerNewPipelineRun(branch, env, 'gabriel.max@ddsulf.com.br');
    setPipelineRuns(productionValidationService.getPipelineRuns());
    return freshRun;
  };

  const advanceValidationStep = (runId: string) => {
    const updated = productionValidationService.advancePipelineSimulated(runId);
    setPipelineRuns(productionValidationService.getPipelineRuns());
    return updated;
  };

  return {
    pipelineRuns,
    triggerValidationRun,
    advanceValidationStep,
    refreshValidationRuns: () => setPipelineRuns(productionValidationService.getPipelineRuns())
  };
}
