import { useState, useEffect } from 'react';
import { AnalyticsService } from '@/services/analytics/analytics';

export function useOperationalMetrics() {
  const [metrics, setMetrics] = useState({
    pipelines: {
      Rascunho: 0,
      Enviado: 0,
      Aprovado: 0,
      Executado: 0,
      Cancelado: 0
    } as Record<string, number>,
    totalQuotesCount: 0,
    clientConversionRatePercent: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  async function calculate() {
    try {
      setLoading(true);
      const res = await AnalyticsService.getOperationalAnalytics();
      setMetrics(res);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    calculate();
  }, []);

  return {
    ...metrics,
    isLoading: loading,
    error,
    recalculate: calculate
  };
}

export default useOperationalMetrics;
