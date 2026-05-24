import { useState, useEffect, useMemo } from 'react';
import { costEngineService } from '../services/costEngineService';
import { summarizeOperationalAnalytics } from '../analytics/financialAnalytics';
import { EnvironmentType } from '@/types/database';
import { OperationalCostBreakdown, ProfitabilityMetrics } from '../types';

export interface LegacySnapshotAdapter {
  id: string;
  environment: EnvironmentType;
  costBreakdown: OperationalCostBreakdown;
  profitMetrics: ProfitabilityMetrics;
  timestamp: string;
}

export function useCostAnalytics() {
  const [snapshots, setSnapshots] = useState<LegacySnapshotAdapter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchSnapshots() {
      try {
        setLoading(true);
        const data = await costEngineService.loadTransactionalSnapshots();
        
        // Adapt schema properties if standard format differs
        const formatted: LegacySnapshotAdapter[] = data.map((d: any) => ({
          id: d.id || `snap_${Math.random()}`,
          environment: d.environment || d.environmentType || 'Residência',
          costBreakdown: d.costBreakdown || {
            chemicalProducts: { totalRawCost: d.totalDirectCosts * 0.4 || 0, wasteSafetyAdjustment: 0, totalCost: d.totalDirectCosts * 0.4 || 0, items: [] },
            logistics: { displacementKm: 0, costPerKm: 1.85, totalLogisticsCost: d.totalDirectCosts * 0.2 || 0, estimatedTransitHours: 0 },
            labor: { technicianCount: 1, totalManHoursSpent: 0, hourlyCostRate: 45, totalLaborCost: d.totalDirectCosts * 0.3 || 0 },
            indirectAllocation: { allocatedOverheadCost: d.totalIndirectCosts || 0, equipmentAmortization: 0, complexityRiskFactor: 0, indirectFeeTotal: d.totalIndirectCosts || 0 },
            subtotalDirectCost: d.totalDirectCosts || 0,
            subtotalTotalCost: (d.totalDirectCosts + d.totalIndirectCosts) || 0,
            taxAmount: 0,
            totalOperationalCost: (d.totalDirectCosts + d.totalIndirectCosts) || 0
          },
          profitMetrics: d.profitMetrics || {
            sellingPrice: d.totalRevenue || 0,
            breakEvenPrice: d.totalDirectCosts + d.totalIndirectCosts || 0,
            minPermittedPrice: 0,
            profitAmount: d.netProfitAmount || 0,
            grossMarginPercent: d.averageMarginPercent || 0,
            netMarginPercent: d.averageMarginPercent || 0,
            riskCoefficient: 'OTIMIZADO',
            viabilityScore: 80
          },
          timestamp: d.timestamp || new Date().toISOString()
        }));

        setSnapshots(formatted);
      } catch (err) {
        console.error('Falha ao recuperar snapshots operacionais:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSnapshots();
  }, []);

  const aggregatedReport = useMemo(() => {
    return summarizeOperationalAnalytics(snapshots);
  }, [snapshots]);

  const recordServiceSnapshot = async (
    title: string,
    environment: EnvironmentType,
    costBreakdown: OperationalCostBreakdown,
    profitMetrics: ProfitabilityMetrics
  ) => {
    const fresh: LegacySnapshotAdapter = {
      id: `snap_${Date.now()}`,
      environment,
      costBreakdown,
      profitMetrics,
      timestamp: new Date().toISOString()
    };

    setSnapshots(prev => [fresh, ...prev]);

    // Save to server
    await costEngineService.saveTransactionalSnapshot({
      id: fresh.id,
      title,
      timestamp: fresh.timestamp,
      totalRevenue: profitMetrics.sellingPrice,
      totalDirectCosts: costBreakdown.subtotalDirectCost,
      totalIndirectCosts: costBreakdown.indirectAllocation.indirectFeeTotal,
      netProfitAmount: profitMetrics.profitAmount,
      averageMarginPercent: profitMetrics.netMarginPercent,
      serviceCount: 1
    });
  };

  return {
    snapshots,
    loading,
    analytics: aggregatedReport,
    recordServiceSnapshot
  };
}
