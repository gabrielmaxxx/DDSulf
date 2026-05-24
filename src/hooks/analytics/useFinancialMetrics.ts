import { useState, useEffect } from 'react';
import { AnalyticsService } from '@/services/analytics/analytics';
import { useRealtimeStore } from '@/store/useRealtimeStore';

export function useFinancialMetrics(startDateISO?: string) {
  const [metrics, setMetrics] = useState({
    revenueTotal: 0,
    costsTotal: 0,
    netMarginValue: 0,
    marginPercent: 0,
    ebitda: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isOnline = useRealtimeStore((state) => state.isOnline);

  async function calculate() {
    try {
      setLoading(true);
      const res = await AnalyticsService.getFinancialAnalytics(startDateISO);
      setMetrics(res);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    calculate();
  }, [startDateISO, isOnline]);

  return {
    ...metrics,
    isLoading: loading,
    error,
    recalculate: calculate
  };
}

export default useFinancialMetrics;
