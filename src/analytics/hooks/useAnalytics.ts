/**
 * Custom React Hook: useAnalytics
 * Master coordinator driving periods changes, active caching, and dynamic aggregations.
 */

import { useState, useEffect } from 'react';
import { AnalyticalPeriod, KPIMetric } from '../types';
import { AnalyticsEngineService } from '../services/analyticsEngine';
import { AIContextEngine } from '../../ai/context';

export function useAnalytics(initialPeriod: AnalyticalPeriod = '30d') {
  const [period, setPeriod] = useState<AnalyticalPeriod>(initialPeriod);
  const [kpis, setKpis] = useState<KPIMetric[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const context = AIContextEngine.getCachedContext();
  const userRole = context.activeRole || 'visualizador';

  const refreshKPIs = () => {
    setLoading(true);
    try {
      const computed = AnalyticsEngineService.calculateKPIs(userRole, period);
      setKpis(computed);
    } catch (e) {
      console.error('[useAnalytics] Aggregation calculation fail:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshKPIs();
  }, [period, userRole]);

  return {
    period,
    setPeriod,
    kpis,
    loading,
    refreshKPIs,
    userRole,
    isFinancialVisibilityMasked: userRole === 'tecnico' || userRole === 'visualizador'
  };
}

export default useAnalytics;
