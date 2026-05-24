import { useState, useEffect, useCallback } from 'react';
import { analyticsService } from '../services/analyticsService';
import { HistoricalMetrics } from '../types';

export function useHistoricalMetrics() {
  const [metrics, setMetrics] = useState<HistoricalMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshMetrics = useCallback(() => {
    setLoading(true);
    try {
      const data = analyticsService.getHistoricalMetrics();
      setMetrics(data);
    } catch (e) {
      console.error('Failed to lift historical metrics', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshMetrics();

    // Listen to local storage writes to auto-refresh whenever a new pricing is quote-finalized
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ddsulf_analytics_snapshots') {
        refreshMetrics();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [refreshMetrics]);

  return { metrics, loading, refreshMetrics };
}
