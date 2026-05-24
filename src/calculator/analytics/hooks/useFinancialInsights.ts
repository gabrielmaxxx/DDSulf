import { useState, useEffect } from 'react';
import { useHistoricalMetrics } from './useHistoricalMetrics';
import { useOperationalIntelligence } from './useOperationalIntelligence';

export function useFinancialInsights() {
  const { metrics, loading: mLoading } = useHistoricalMetrics();
  const { insights, loading: iLoading } = useOperationalIntelligence();
  const [financialTrends, setFinancialTrends] = useState<any>(null);

  useEffect(() => {
    if (metrics) {
      // Create detailed financial insights structure
      const healthFactor = metrics.margemMediaPercent > 70 ? 'Excelente' : metrics.margemMediaPercent > 55 ? 'Saudável' : 'Alerta de Baixa Margem';
      const chemicalExhaustionRisk = insights.filter(i => i.type === 'chemical_efficiency').length > 1 ? 'Alto' : 'Baixo';
      const potentialRecoverableLoss = insights
        .filter(i => i.impactType === 'revenue_leak' || i.type === 'margin_leakage')
        .reduce((sum, item) => sum + item.impactValue, 0);

      setFinancialTrends({
        healthFactor,
        chemicalExhaustionRisk,
        potentialRecoverableLoss,
        ticketMedio: metrics.ticketMedio,
        lucratividadeTotal: metrics.lucratividadeTotal,
        margemMediaPercent: metrics.margemMediaPercent,
        breakEvenIndex: 25 // Average percentage of price representing costs
      });
    }
  }, [metrics, insights]);

  return {
    trends: financialTrends,
    loading: mLoading || iLoading,
    financialInsightsList: insights.filter(i => ['financial_health', 'margin_leakage', 'pricing_optimization'].includes(i.type))
  };
}
