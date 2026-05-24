import { OperationalFinancialSnapshot, OperationalCostBreakdown, ProfitabilityMetrics } from '../types';
import { EnvironmentType } from '@/types/database';

export interface CostCategoryAggregator {
  chemicals: number;
  logistics: number;
  labor: number;
  allocatedOverhead: number;
  taxes: number;
  unassigned: number;
}

export interface OperationalProfitSegment {
  environment: EnvironmentType;
  averageMargin: number;
  totalIncome: number;
  totalCost: number;
  volumeCount: number;
}

/**
 * Aggregates arrays of individual financial execution reports onto high-level operational dashboards
 */
export function summarizeOperationalAnalytics(snapshots: Array<{
  id: string;
  environment: EnvironmentType;
  costBreakdown: OperationalCostBreakdown;
  profitMetrics: ProfitabilityMetrics;
  timestamp: string;
}>): {
  totalRevenue: number;
  totalCosts: number;
  netProfit: number;
  aggregateMarginPercent: number;
  costProportions: CostCategoryAggregator;
  environmentSegments: Record<EnvironmentType, OperationalProfitSegment>;
  volumeHistory: Array<{ date: string; amount: number; cost: number }>;
} {
  let totalRevenue = 0;
  let totalCosts = 0;

  let totalChemicals = 0;
  let totalLogistics = 0;
  let totalLabor = 0;
  let totalOverhead = 0;
  let totalTaxes = 0;

  // Segment summaries
  const segmentStats: Record<EnvironmentType, { count: number; income: number; cost: number; sumMargin: number }> = {
    'Residência': { count: 0, income: 0, cost: 0, sumMargin: 0 },
    'Comércio': { count: 0, income: 0, cost: 0, sumMargin: 0 },
    'Indústria': { count: 0, income: 0, cost: 0, sumMargin: 0 },
    'Restaurante': { count: 0, income: 0, cost: 0, sumMargin: 0 },
    'Condomínio': { count: 0, income: 0, cost: 0, sumMargin: 0 },
    'Hospital': { count: 0, income: 0, cost: 0, sumMargin: 0 },
    'Área Externa': { count: 0, income: 0, cost: 0, sumMargin: 0 }
  };

  const dayMap = new Map<string, { income: number; cost: number }>();

  snapshots.forEach(snapshot => {
    const { costBreakdown, profitMetrics, environment, timestamp } = snapshot;
    
    totalRevenue += profitMetrics.sellingPrice;
    totalCosts += costBreakdown.totalOperationalCost;

    totalChemicals += costBreakdown.chemicalProducts.totalCost;
    totalLogistics += costBreakdown.logistics.totalLogisticsCost;
    totalLabor += costBreakdown.labor.totalLaborCost;
    totalOverhead += costBreakdown.indirectAllocation.indirectFeeTotal;
    totalTaxes += costBreakdown.taxAmount;

    // Segment mappings
    if (segmentStats[environment]) {
      const stats = segmentStats[environment];
      stats.count += 1;
      stats.income += profitMetrics.sellingPrice;
      stats.cost += costBreakdown.totalOperationalCost;
      stats.sumMargin += profitMetrics.netMarginPercent;
    }

    // Historical day maps
    try {
      const dateStr = timestamp.split('T')[0] || 'Unassigned';
      const dayData = dayMap.get(dateStr) || { income: 0, cost: 0 };
      dayData.income += profitMetrics.sellingPrice;
      dayData.cost += costBreakdown.totalOperationalCost;
      dayMap.set(dateStr, dayData);
    } catch {
      // safe fallback for unusual timestamps
    }
  });

  const netProfit = totalRevenue - totalCosts;
  const aggregateMarginPercent = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // Format segmented responses
  const environmentSegments = {} as Record<EnvironmentType, OperationalProfitSegment>;
  (Object.keys(segmentStats) as EnvironmentType[]).forEach(key => {
    const s = segmentStats[key];
    environmentSegments[key] = {
      environment: key,
      averageMargin: s.count > 0 ? Number((s.sumMargin / s.count).toFixed(1)) : 0,
      totalIncome: Number(s.income.toFixed(2)),
      totalCost: Number(s.cost.toFixed(2)),
      volumeCount: s.count
    };
  });

  // Timeline chronology format sorted ascending
  const volumeHistory = Array.from(dayMap.entries())
    .map(([date, data]) => ({
      date,
      amount: Number(data.income.toFixed(2)),
      cost: Number(data.cost.toFixed(2))
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalRevenue: Number(totalRevenue.toFixed(2)),
    totalCosts: Number(totalCosts.toFixed(2)),
    netProfit: Number(netProfit.toFixed(2)),
    aggregateMarginPercent: Number(aggregateMarginPercent.toFixed(1)),
    costProportions: {
      chemicals: totalCosts > 0 ? Number((totalChemicals / totalCosts * 100).toFixed(1)) : 0,
      logistics: totalCosts > 0 ? Number((totalLogistics / totalCosts * 100).toFixed(1)) : 0,
      labor: totalCosts > 0 ? Number((totalLabor / totalCosts * 100).toFixed(1)) : 0,
      allocatedOverhead: totalCosts > 0 ? Number((totalOverhead / totalCosts * 100).toFixed(1)) : 0,
      taxes: totalCosts > 0 ? Number((totalTaxes / totalCosts * 100).toFixed(1)) : 0,
      unassigned: 0
    },
    environmentSegments,
    volumeHistory
  };
}
