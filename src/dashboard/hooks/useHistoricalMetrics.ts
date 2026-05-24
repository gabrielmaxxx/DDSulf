import { useMemo } from 'react';
import { useDashboardMetrics } from './useDashboardMetrics';
import { DashboardTimePeriod } from '../types';

export function useHistoricalMetrics(period: DashboardTimePeriod = 'monthly') {
  const { trends, loading, refreshMetrics } = useDashboardMetrics(period);

  const stats = useMemo(() => {
    if (trends.length === 0) return { avgRevenue: 0, peakRevenue: 0 };

    const totalRevenue = trends.reduce((sum, t) => sum + t.revenue, 0);
    const avgRevenue = totalRevenue / trends.length;
    const peakRevenue = Math.max(...trends.map(t => t.revenue));

    return {
      avgRevenue,
      peakRevenue
    };
  }, [trends]);

  return {
    trends,
    loading,
    avgWeeklyRevenue: stats.avgRevenue,
    peakRevenue: stats.peakRevenue,
    recalculate: refreshMetrics
  };
}

export default useHistoricalMetrics;
