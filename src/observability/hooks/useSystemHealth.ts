/**
 * Hook: useSystemHealth
 * Fetches computed DDSulf operational overall health ratios and explainability parameters.
 */

import { useState, useEffect } from 'react';
import { diagnosticsService, incidentService } from '../services';
import { SystemHealthScore } from '../types';

export function useSystemHealth() {
  const [healthScore, setHealthScore] = useState<SystemHealthScore>(() => 
    diagnosticsService.getSystemHealth(incidentService.getIncidents('unresolved').length)
  );

  useEffect(() => {
    const checkInterval = setInterval(() => {
      const activeUnresolvedCount = incidentService.getIncidents('unresolved').length;
      setHealthScore(diagnosticsService.getSystemHealth(activeUnresolvedCount));
    }, 1500);

    return () => clearInterval(checkInterval);
  }, []);

  return {
    healthScore,
    calibrateAIExplainabilityIndex: (score: number) => {
      diagnosticsService.calibrateExplainability(score);
      setHealthScore(prev => ({ ...prev, aiExplainabilityScore: score }));
    }
  };
}
