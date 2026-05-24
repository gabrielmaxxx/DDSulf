/**
 * Custom React Hook: useComparativeAnalytics
 * Facilitates chronological comparison data pipelines supporting multi-line trends graphs.
 */

import { useState, useEffect } from 'react';
import { AnalyticalPeriod, CompareSeries } from '../types';
import { AnalyticsEngineService } from '../services/analyticsEngine';

export function useComparativeAnalytics(period: AnalyticalPeriod = '30d') {
  const [comparativeSeries, setComparativeSeries] = useState<CompareSeries[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    try {
      const data = AnalyticsEngineService.getHistoricalSeries(period);
      setComparativeSeries(data);
    } catch (e) {
      console.error('[useComparativeAnalytics] Historical parse failed:', e);
    } finally {
      setLoading(false);
    }
  }, [period]);

  const getCombinedDataForCharts = () => {
    if (comparativeSeries.length < 2) return [];
    
    // Merge actual and previous series based on periods labels
    const actual = comparativeSeries[0].data;
    const previous = comparativeSeries[1].data;

    return actual.map((item, idx) => {
      const prevMatched = previous[idx] || { revenue: 0, costs: 0, profit: 0 };
      return {
        label: item.periodLabel,
        'Atual Revenue': item.revenue,
        'Atual Cost': item.costs,
        'Atual Profit': item.profit,
        'Anterior Revenue': prevMatched.revenue,
        'Anterior Cost': prevMatched.costs,
        'Anterior Profit': prevMatched.profit
      };
    });
  };

  return {
    comparativeSeries,
    combinedChartData: getCombinedDataForCharts(),
    loading
  };
}

export default useComparativeAnalytics;
