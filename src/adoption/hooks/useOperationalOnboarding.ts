/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';
import { onboardingService } from '../services/onboardingService';
import { OnboardingStep } from '../types';

export function useOperationalOnboarding() {
  const [steps, setSteps] = useState<OnboardingStep[]>(() => onboardingService.getSteps());

  const refreshSteps = useCallback(() => {
    setSteps([...onboardingService.getSteps()]);
  }, []);

  const startStep = useCallback((id: string) => {
    onboardingService.startStep(id);
    refreshSteps();
  }, [refreshSteps]);

  const completeStep = useCallback((id: string) => {
    onboardingService.completeStep(id);
    refreshSteps();
  }, [refreshSteps]);

  const resetOnboarding = useCallback(() => {
    onboardingService.resetOnboarding();
    refreshSteps();
  }, [refreshSteps]);

  return {
    steps,
    startStep,
    completeStep,
    resetOnboarding
  };
}
export default useOperationalOnboarding;
