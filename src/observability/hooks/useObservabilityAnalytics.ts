/**
 * Hook: useObservabilityAnalytics
 * Coordinates database counts, tracking total read and write thresholds on operational pages.
 */

import { useState, useEffect } from 'react';
import { observabilityAnalyticsService } from '../services';

export function useObservabilityAnalytics() {
  const [stats, setStats] = useState(() => observabilityAnalyticsService.getDatabaseOpsSLA());

  useEffect(() => {
    const update = setInterval(() => {
      setStats(observabilityAnalyticsService.getDatabaseOpsSLA());
    }, 2000);
    return () => clearInterval(update);
  }, []);

  return {
    stats,
    trackReadOperation: (count?: number) => {
      observabilityAnalyticsService.trackIncrementalRead(count);
      setStats(observabilityAnalyticsService.getDatabaseOpsSLA());
    },
    trackWriteOperation: (count?: number) => {
      observabilityAnalyticsService.trackIncrementalWrite(count);
      setStats(observabilityAnalyticsService.getDatabaseOpsSLA());
    },
    resetOperationalCounters: () => {
      observabilityAnalyticsService.resetCounters();
      setStats(observabilityAnalyticsService.getDatabaseOpsSLA());
    }
  };
}
