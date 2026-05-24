/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo } from 'react';
import { useOperationalOnboarding } from './useOperationalOnboarding';
import { OnboardingStepStatus } from '../types';

export function useAdoptionProgress() {
  const { steps } = useOperationalOnboarding();

  const progressPercent = useMemo(() => {
    if (steps.length === 0) return 0;
    const completed = steps.filter(s => s.status === OnboardingStepStatus.COMPLETED).length;
    return Math.round((completed / steps.length) * 100);
  }, [steps]);

  return {
    progressPercent,
    completedStepsCount: steps.filter(s => s.status === OnboardingStepStatus.COMPLETED).length,
    totalStepsCount: steps.length
  };
}
export default useAdoptionProgress;
