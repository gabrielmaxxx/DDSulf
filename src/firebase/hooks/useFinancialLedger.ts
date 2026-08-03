import { useState, useEffect } from 'react';
import AnalyticsService from '@/services/analytics/analytics';
import { costsService, revenuesService } from '@/services/financial/financial';
import { FinancialCost, Revenue } from '@/types/database';
import { useAuth } from '@/auth/hooks/useAuth';

export function useFinancialLedger(passedEmpresaId?: string) {
  const { empresaId: authEmpresaId } = useAuth();
  const empresaId = passedEmpresaId || authEmpresaId || '';

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
    if (!empresaId) return;
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
    if (!empresaId) return;
    await costsService.registerCost(empresaId, payload);
    await loadFinancialData();
  };

  const addRevenue = async (payload: Omit<Revenue, 'id' | 'createdAt'>) => {
    if (!empresaId) return;
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
