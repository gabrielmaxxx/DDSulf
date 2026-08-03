import { useState, useEffect } from 'react';
import { AnalyticsService } from '@/services/analytics/analytics';
import { useAuth } from '@/auth/hooks/useAuth';

export function useOperationalMetrics(passedEmpresaId?: string) {
  const { empresaId: authEmpresaId } = useAuth();
  const empresaId = passedEmpresaId || authEmpresaId || '';

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
    if (!empresaId) return;
    try {
      setLoading(true);
      const res = await AnalyticsService.getOperationalAnalytics(empresaId);
      setMetrics(res);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    calculate();
  }, [empresaId]);

  return {
    ...metrics,
    isLoading: loading,
    error,
    recalculate: calculate
  };
}

export default useOperationalMetrics;
