/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { resilienceValidationService } from '../services/resilienceValidationService';
import { ChaosExperiment } from '../types';

export function useResilienceValidation() {
  const [experiments, setExperiments] = useState<ChaosExperiment[]>(() =>
    resilienceValidationService.getExperiments()
  );
  const [mttr, setMttr] = useState<number>(() => resilienceValidationService.getMTTR());
  const [degradationScore, setDegradationScore] = useState<number>(() =>
    resilienceValidationService.getGracefulDegradationScore()
  );

  useEffect(() => {
    const unsubscribe = resilienceValidationService.subscribe(() => {
      setExperiments([...resilienceValidationService.getExperiments()]);
      setMttr(resilienceValidationService.getMTTR());
      setDegradationScore(resilienceValidationService.getGracefulDegradationScore());
    });
    return () => unsubscribe();
  }, []);

  const injectChaos = useCallback(async (id: string) => {
    await resilienceValidationService.triggerExperiment(id);
  }, []);

  const recoverChaos = useCallback((id: string) => {
    resilienceValidationService.stopExperiment(id);
  }, []);

  const recoverAll = useCallback(() => {
    resilienceValidationService.stopAllExperiments();
  }, []);

  return {
    experiments,
    mttr,
    degradationScore,
    injectChaos,
    recoverChaos,
    recoverAll
  };
}
export default useResilienceValidation;
