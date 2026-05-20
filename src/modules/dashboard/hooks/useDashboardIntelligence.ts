import { useState, useEffect, useMemo } from 'react';
import { analyticsService } from '../services/analyticsService';
import { Quote, FinancialCost, Revenue, HistoricalInsight } from '@/types/database';

export function useDashboardIntelligence() {
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
      try {
        const result = await analyticsService.getDashboardData();
        setData(result);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const metrics = useMemo(() => {
    const { quotes, costs, revenues } = data;
    
    const totalRevenue = revenues.reduce((acc, r) => acc + r.amount, 0);
    const totalCost = costs.reduce((acc, c) => acc + c.amount, 0);
    const avgMargin = quotes.length > 0 
      ? quotes.reduce((acc, q) => acc + q.estimatedMargin, 0) / quotes.length 
      : 0;
    const ticketMedio = revenues.length > 0 ? totalRevenue / revenues.length : 0;
    
    // Growth simulation for visuals (comparing with "last period" which we mock here)
    const growth = {
      revenue: 12.5,
      margin: -2.3,
      services: 8.4,
      cost: 4.1
    };

    const insights = analyticsService.generateInsights(quotes, costs, revenues);

    // Productivity: simple mock based on quote count vs technicians
    const totalTechsCount = quotes.reduce((acc, q) => acc + q.suggestedTeam, 0);
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
        reworkRate: 3.2, // Mocked
        avgTime: quotes.length > 0 ? quotes.reduce((acc, q) => acc + q.estimatedTime, 0) / quotes.length : 0
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
