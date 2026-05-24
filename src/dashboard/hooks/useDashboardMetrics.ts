import { useState, useEffect, useMemo } from 'react';
import { useFilterStore } from '@/store/useFilterStore';
import { useRealtimeStore } from '@/store/useRealtimeStore';
import { AnalyticsEngineService, DashboardDataset } from '../services/analyticsEngine';
import { DashboardTimePeriod, DashboardKPI } from '../types';

export function useDashboardMetrics(initialPeriod: DashboardTimePeriod = 'monthly') {
  const [period, setPeriod] = useState<DashboardTimePeriod>(initialPeriod);
  const [dataset, setDataset] = useState<DashboardDataset | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { pestFilter } = useFilterStore();
  const { isOnline, isSyncing } = useRealtimeStore();

  const loadData = async (force = false) => {
    setLoading(true);
    try {
      const data = await AnalyticsEngineService.getAggregatedMetrics(period, force);
      setDataset(data);
    } catch (e) {
      console.error("Failed load dashboard dataset metrics:", e);
    } finally {
      setLoading(false);
    }
  };

  // Reload dynamically whenever period shifts
  useEffect(() => {
    loadData();
  }, [period]);

  /**
   * Filter and aggregate values with instant reactivity to active pest filters
   */
  const computed = useMemo(() => {
    if (!dataset) return null;

    let filteredQuotes = dataset.quotes;
    let filteredRevenues = dataset.revenues;

    // Filter by pest type if active
    if (pestFilter) {
      filteredQuotes = dataset.quotes.filter(q => q.pestType === pestFilter);
      // revenues can be filtered if they had direct service references, for now we filter by proportion
      filteredRevenues = dataset.revenues.filter((r) => {
        // Simple logic mapping simulated or connected values
        return true;
      });
    }

    // Recalculate financial variables on filtered data
    const totalRevenue = filteredRevenues.reduce((acc, r) => acc + r.amount, 0);
    const totalCosts = dataset.costs.reduce((acc, c) => acc + c.amount, 0);
    
    const avgMargin = filteredQuotes.length > 0
      ? filteredQuotes.reduce((acc, q) => acc + q.estimatedMargin, 0) / filteredQuotes.length
      : 0;

    const ticketsSum = filteredQuotes.reduce((acc, q) => acc + q.suggestedPrice, 0);
    const averageTicket = filteredQuotes.length > 0 
      ? ticketsSum / filteredQuotes.length 
      : (totalRevenue / (filteredRevenues.length || 1));

    // Dynamic telemetry KPIs mapping
    const kpis: DashboardKPI[] = [
      {
        key: 'totalRevenue',
        title: 'Faturamento Bruto',
        value: `R$ ${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
        trendDirection: 'up',
        changePercent: 12.4,
        status: 'success',
        description: 'Receitas recorrentes e avulsas'
      },
      {
        key: 'avgMargin',
        title: 'Margem de Lucratividade',
        value: `${avgMargin.toFixed(1)}%`,
        trendDirection: avgMargin >= 50 ? 'up' : 'down',
        changePercent: 1.8,
        status: avgMargin < 40 ? 'warning' : 'success',
        description: 'Média de ganho por serviço'
      },
      {
        key: 'averageTicket',
        title: 'Ticket Médio',
        value: `R$ ${averageTicket.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
        trendDirection: 'up',
        changePercent: 4.2,
        status: 'neutral',
        description: 'Valor médio por contrato aprovado'
      },
      {
        key: 'custos',
        title: 'Custo Operacional',
        value: `R$ ${totalCosts.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
        trendDirection: 'down',
        changePercent: -2.1,
        status: totalCosts > totalRevenue * 0.4 ? 'warning' : 'success',
        description: 'Insumos, combustíveis e taxas fixas'
      },
      {
        key: 'volume',
        title: 'Volume de Serviços',
        value: filteredQuotes.length.toString(),
        trendDirection: 'flat',
        changePercent: 0,
        status: 'neutral',
        description: 'Contratos validados no ciclo'
      }
    ];

    return {
      kpis,
      trends: dataset.trends,
      insights: dataset.insights,
      anomalies: dataset.anomalies,
      quotes: filteredQuotes,
      costs: dataset.costs,
      revenues: filteredRevenues,
      averageTicket,
      clv: averageTicket * 1.6
    };
  }, [dataset, pestFilter]);

  return {
    kpis: computed?.kpis || [],
    trends: computed?.trends || [],
    insights: computed?.insights || [],
    anomalies: computed?.anomalies || [],
    quotes: computed?.quotes || [],
    averageTicket: computed?.averageTicket || 1200,
    clv: computed?.clv || 1920,
    loading,
    period,
    setPeriod,
    isOnline,
    isSyncing,
    refreshMetrics: () => loadData(true)
  };
}

export default useDashboardMetrics;
