import { useState, useEffect } from 'react';
import AnalyticsService from '@/services/analytics/analytics';
import { costsService, revenuesService } from '@/services/financial/financial';
import { FinancialCost, Revenue } from '@/types/database';
import { DEFAULT_EMPRESA_ID } from '@/tenant';

export function useFinancialLedger(empresaId: string = DEFAULT_EMPRESA_ID) {
  const [analytics, setAnalytics] = useState({
    revenueTotal: 0,
    costsTotal: 0,
    netMarginValue: 0,
    marginPercent: 0,
    ebitda: 0,
  });
  const [costs, setCosts] = useState<FinancialCost[]>([]);
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  async function loadFinancialData() {
    try {
      setLoading(true);
      const metrics = await AnalyticsService.getFinancialAnalytics(empresaId);
      const costsList = await costsService.list(empresaId);
      const revenuesList = await revenuesService.list(empresaId);

      setAnalytics(metrics);
      setCosts(costsList);
      setRevenues(revenuesList);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFinancialData();
  }, [empresaId]);

  const addCost = async (payload: Omit<FinancialCost, 'id' | 'createdAt'>) => {
    await costsService.registerCost(empresaId, payload);
    await loadFinancialData();
  };

  const addRevenue = async (payload: Omit<Revenue, 'id' | 'createdAt'>) => {
    await revenuesService.registerRevenue(empresaId, payload);
    await loadFinancialData();
  };

  return {
    ...analytics,
    costs,
    revenues,
    loading,
    error,
    refresh: loadFinancialData,
    registerCost: addCost,
    registerRevenue: addRevenue
  };
}

export default useFinancialLedger;
