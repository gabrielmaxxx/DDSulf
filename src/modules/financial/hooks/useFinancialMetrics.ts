import { useState, useEffect, useMemo } from 'react';
import { financialService } from '../services/financialService';
import { FinancialCost, Revenue } from '@/types/database';

export function useFinancialMetrics() {
  const [costs, setCosts] = useState<FinancialCost[]>([]);
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [costsData, revenuesData] = await Promise.all([
          financialService.getCosts(),
          financialService.getRevenues()
        ]);
        setCosts(costsData);
        setRevenues(revenuesData);
      } catch (err) {
        console.error('Error fetching financial data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const metrics = useMemo(() => {
    const totalRevenue = revenues.reduce((acc, rev) => acc + rev.amount, 0);
    const totalCost = costs.reduce((acc, cost) => acc + cost.amount, 0);
    const netProfit = totalRevenue - totalCost;
    const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Grouping for charts
    const revenueByDay: Record<string, number> = {};
    revenues.forEach(rev => {
      const date = rev.receivedAt.split('T')[0];
      revenueByDay[date] = (revenueByDay[date] || 0) + rev.amount;
    });

    const chartData = Object.entries(revenueByDay)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7);

    return {
      totalRevenue,
      totalCost,
      netProfit,
      margin,
      chartData,
      transactionCount: revenues.length + costs.length
    };
  }, [costs, revenues]);

  return {
    metrics,
    costs,
    revenues,
    loading,
    refresh: () => {
      setLoading(true);
      // Logic inside useEffect will run if we add a trigger, or just re-call the same function
    }
  };
}
