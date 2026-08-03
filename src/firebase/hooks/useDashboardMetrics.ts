import { useState, useEffect } from 'react';
import { dashboardService } from '@/services/dashboard/dashboard';
import { logOperationalEvent } from '@/firebase/analytics';
import { useAuth } from '@/auth/hooks/useAuth';

/**
 * Hook to manage reactive dashboard aggregates offline-first
 */
export function useDashboardMetrics(passedEmpresaId?: string) {
  const { empresaId: authEmpresaId } = useAuth();
  const empresaId = passedEmpresaId || authEmpresaId || '';

  const [metrics, setMetrics] = useState({
    activeQuotesCount: 0,
    completedServicesCount: 0,
    warningsCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;

    if (!empresaId) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        const liveAggs = await dashboardService.computeLiveAggregates(empresaId);
        if (active) {
          setMetrics(liveAggs);
        }
      } catch (err: any) {
        if (active) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchData();

    // Set up continuous periodic syncing fallback for background operations
    const interval = setInterval(fetchData, 60000); // 1-minute metric sync
    
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [empresaId]);

  const triggerManualRecalculation = async () => {
    if (!empresaId) return;
    logOperationalEvent('dashboard_metrics_manual_refresh', { triggeredBy: 'UI_Action' });
    try {
      const liveAggs = await dashboardService.computeLiveAggregates(empresaId);
      setMetrics(liveAggs);
    } catch (err: any) {
      console.warn('[useDashboardMetrics] Manual trigger aggregation error:', err);
    }
  };

  return {
    ...metrics,
    loading,
    error,
    refresh: triggerManualRecalculation
  };
}

export default useDashboardMetrics;
