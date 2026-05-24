import { useState, useEffect, useCallback } from 'react';
import { analyticsService } from '../services/analyticsService';
import { OperationalSnapshot } from '../types';
import { PricingInputs, PricingBreakdown } from '../../types';

export function useQuoteAnalytics(quoteId?: string) {
  const [snapshots, setSnapshots] = useState<OperationalSnapshot[]>([]);
  const [versions, setVersions] = useState<OperationalSnapshot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshData = useCallback(() => {
    setLoading(true);
    try {
      const allSnaps = analyticsService.getAllSnapshots();
      setSnapshots(allSnaps);
      if (quoteId) {
        setVersions(analyticsService.getQuoteVersions(quoteId));
      }
    } catch (e) {
      console.error('Failed to load quote analytics', e);
    } finally {
      setLoading(false);
    }
  }, [quoteId]);

  const saveSnapshot = useCallback((
    targetQuoteId: string, 
    inputs: PricingInputs, 
    breakdown: PricingBreakdown, 
    actor: string, 
    reason?: string
  ) => {
    const fresh = analyticsService.saveSnapshot(targetQuoteId, inputs, breakdown, actor, reason);
    refreshData();
    return fresh;
  }, [refreshData]);

  useEffect(() => {
    refreshData();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ddsulf_analytics_snapshots') {
        refreshData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [refreshData, quoteId]);

  return { snapshots, versions, saveSnapshot, loading, refreshData };
}
