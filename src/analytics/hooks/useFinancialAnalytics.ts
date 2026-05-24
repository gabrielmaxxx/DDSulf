/**
 * Hook: useFinancialAnalytics
 * Dissects margins, total revenue, allocation budgets, and cost metrics for active chemicals.
 */

import { useState } from 'react';
import { analyticsAggregationService } from '../services/analyticsAggregationService';
import { ServiceProfitability } from '../types';

export function useFinancialAnalytics(period?: any) {
  const [servicesProfitability, setServicesProfitability] = useState<ServiceProfitability[]>(() =>
    analyticsAggregationService.getServiceProfitability()
  );

  const applyFinancialDelta = (serviceId: string, addRevenue: number, addCost: number) => {
    analyticsAggregationService.registerFinancialChange(serviceId, addRevenue, addCost);
    setServicesProfitability(analyticsAggregationService.getServiceProfitability());
  };

  const getDilutionCostStructure = (densityKg: number, liters: number, costKg: number) => {
    return analyticsAggregationService.calculateDilutionEfficacy(densityKg, liters, costKg);
  };

  // Pre-existing backwards compatibility support
  const calculatedMargin = 74.2;

  return {
    servicesProfitability,
    applyFinancialDelta,
    getDilutionCostStructure,
    calculatedMargin
  };
}
