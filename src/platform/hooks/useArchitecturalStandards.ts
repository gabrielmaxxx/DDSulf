/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { architectureService, ComponentMetric } from '../services/architectureService';

export function useArchitecturalStandards() {
  const [metrics, setMetrics] = useState<ComponentMetric[]>([]);
  const [cleanCodeIndex, setCleanCodeIndex] = useState(100);

  const calculateArchitectureStats = useCallback(() => {
    const list = architectureService.getComponentMetrics();
    const index = architectureService.compileCleanCodeIndex();

    setMetrics(list);
    setCleanCodeIndex(index);
  }, []);

  useEffect(() => {
    calculateArchitectureStats();
  }, [calculateArchitectureStats]);

  const auditCustomLinesOfCode = useCallback((loc: number, nestingDepth: number) => {
    return architectureService.auditsDraftComplexity(loc, nestingDepth);
  }, []);

  return {
    metrics,
    cleanCodeIndex,
    auditCustomLinesOfCode,
    refreshArchitectureMetrics: calculateArchitectureStats
  };
}
