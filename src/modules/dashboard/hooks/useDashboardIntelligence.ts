import { useState, useEffect, useMemo } from 'react';
import { analyticsService } from '../services/analyticsService';
import { Quote, FinancialCost, Revenue } from '@/types/database';
import { useAuth } from '@/auth/hooks/useAuth';

export function useDashboardIntelligence() {
  const { empresaId } = useAuth();

  const [data, setData] = useState<{
    quotes: Quote[];
    costs: FinancialCost[];
    revenues: Revenue[];
  }>({
    quotes: [],
    costs: [],
    revenues: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      if (!empresaId) return;
      try {
        setLoading(true);
        const result = await analyticsService.getDashboardData(empresaId);
        setData(result);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [empresaId]);

  const metrics = useMemo(() => {
    const { quotes, costs, revenues } = data;
    
    const totalRevenue = revenues.reduce((acc, r) => acc + r.amount, 0);
    const totalCost = costs.reduce((acc, c) => acc + c.amount, 0);
    const avgMargin = quotes.length > 0 
      ? quotes.reduce((acc, q) => acc + q.estimatedMargin, 0) / quotes.length 
      : 0;
    const ticketMedio = revenues.length > 0 ? totalRevenue / revenues.length : 0;
    
    const hasData = quotes.length > 0 || revenues.length > 0 || costs.length > 0;
    const growth = {
      revenue: hasData && totalRevenue > 0 ? 0 : 0,
      margin: 0,
      services: 0,
      cost: 0
    };

    const insights = analyticsService.generateInsights(quotes, costs, revenues);

    // Productivity: based on quote count vs technicians
    const totalTechsCount = quotes.reduce((acc, q) => acc + (q.suggestedTeam || 1), 0);
    const productivity = quotes.length > 0 ? quotes.length / (totalTechsCount || 1) : 0;

    return {
      financial: {
        totalRevenue,
        totalCost,
        netProfit: totalRevenue - totalCost,
        avgMargin,
        ticketMedio,
        growth
      },
      operational: {
        totalServices: quotes.length,
        productivity,
        reworkRate: 0,
        avgTime: quotes.length > 0 ? quotes.reduce((acc, q) => acc + (q.estimatedTime || 0), 0) / quotes.length : 0
      },
      insights
    };
  }, [data]);

  return {
    metrics,
    data,
    loading
  };
}
