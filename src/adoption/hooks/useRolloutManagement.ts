/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';
import { rolloutOrchestrationService } from '../services/rolloutOrchestrationService';
import { RolloutFeatureGate } from '../types';

export function useRolloutManagement() {
  const [gates, setGates] = useState<RolloutFeatureGate[]>(() => rolloutOrchestrationService.getGates());

  const refreshGates = useCallback(() => {
    setGates([...rolloutOrchestrationService.getGates()]);
  }, []);

  const toggleGate = useCallback((id: string) => {
    const success = rolloutOrchestrationService.toggleGate(id);
    if (success) {
      refreshGates();
    }
    return success;
  }, [refreshGates]);

  const adoptIncremental = useCallback((id: string) => {
    rolloutOrchestrationService.incrementGatesAdoption(id);
    refreshGates();
  }, [refreshGates]);

  return {
    gates,
    toggleGate,
    adoptIncremental
  };
}
export default useRolloutManagement;
