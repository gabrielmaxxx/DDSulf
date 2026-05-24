/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { scalabilityGovernanceService, LatencyMetric } from '../services/scalabilityGovernanceService';

export function useScalabilityGovernance() {
  const [latencies, setLatencies] = useState<LatencyMetric[]>([]);
  const [slowRoutes, setSlowRoutes] = useState<LatencyMetric[]>([]);
  const [scalabilityIndex, setScalabilityIndex] = useState(100);

  const compileSlightStats = useCallback(() => {
    const list = scalabilityGovernanceService.getLatencyMetrics();
    const overburdened = scalabilityGovernanceService.getOverburdenedRoutes();
    const index = scalabilityGovernanceService.compileScalabilityIndex();

    setLatencies(list);
    setSlowRoutes(overburdened);
    setScalabilityIndex(index);
  }, []);

  useEffect(() => {
    compileSlightStats();
  }, [compileSlightStats]);

  return {
    latencies,
    slowRoutes,
    scalabilityIndex,
    recalculateScalability: compileSlightStats
  };
}
