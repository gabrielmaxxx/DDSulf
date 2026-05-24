import { useMemo } from 'react';
import { useCostAnalytics } from './useCostAnalytics';
import { processPredictiveFinancialForecast } from '../forecasting/forecastingEngine';
import { FinancialForecastMetrics } from '../types';

export function useFinancialForecast(manualGrowthRate?: number, manualInflationRate?: number) {
  const { analytics, loading } = useCostAnalytics();

  const forecastData: FinancialForecastMetrics[] = useMemo(() => {
    // Determine historical levels of revenue and direct cost ratio
    const historicalRevenue = analytics.totalRevenue > 0 ? analytics.totalRevenue : 48000.0;
    
    // Direct cost ratio = total direct costs / total revenue
    const directCostsRate = analytics.totalCosts > 0 && analytics.totalRevenue > 0
      ? (analytics.totalCosts * 0.65 / analytics.totalRevenue)
      : 0.38;

    const fixedCostsAmount = analytics.totalCosts > 0 
      ? (analytics.totalCosts * 0.35)
      : 12500.0;

    return processPredictiveFinancialForecast(
      historicalRevenue,
      directCostsRate,
      fixedCostsAmount,
      manualGrowthRate !== undefined ? manualGrowthRate : 0.08, // 8% monthly growth base
      manualInflationRate !== undefined ? manualInflationRate : 0.035 // 3.5% inflation base
    );
  }, [analytics, manualGrowthRate, manualInflationRate]);

  return {
    forecastData,
    loading
  };
}
