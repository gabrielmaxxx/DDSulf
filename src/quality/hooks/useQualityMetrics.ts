/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { reliabilityAnalyticsService } from '../services/reliabilityAnalyticsService';
import { ReliabilityMetric } from '../types';

export function useQualityMetrics() {
  const [reliabilityIndex, setReliabilityIndex] = useState(() =>
    reliabilityAnalyticsService.getReliabilityIndex()
  );
  const [scoreHistory, setScoreHistory] = useState<number[]>(() =>
    reliabilityAnalyticsService.getScoreHistory()
  );
  const [metrics, setMetrics] = useState<ReliabilityMetric[]>(() =>
    reliabilityAnalyticsService.getLiveMetrics()
  );

  const refreshMetrics = useCallback(() => {
    const freshIndex = reliabilityAnalyticsService.getReliabilityIndex();
    setReliabilityIndex(freshIndex);
    setScoreHistory([...reliabilityAnalyticsService.getScoreHistory()]);
    setMetrics([...reliabilityAnalyticsService.getLiveMetrics()]);
    
    // Add to history occasionally to simulate live tracking
    reliabilityAnalyticsService.addToHistory(freshIndex);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      refreshMetrics();
    }, 3000);
    return () => clearInterval(timer);
  }, [refreshMetrics]);

  return {
    reliabilityIndex,
    scoreHistory,
    metrics,
    refreshMetrics
  };
}
export default useQualityMetrics;
