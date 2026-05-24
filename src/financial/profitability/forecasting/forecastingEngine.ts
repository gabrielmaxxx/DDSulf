import { ProfitabilityTrendPoint } from '../types';

/**
 * Generates forward predictive margin trend indicators based on retrospective performance logs.
 */
export function modelMarginTrendProjections(
  historicalPoints: Array<{ date: string; marginPercent: number; revenue: number; costs: number }>,
  inflationIndex: number = 0.045, // annual ingredient cost raise
  demandSeasonalFactor: number = 0.08 // seasonal spike in pest reproduction (summer/rainy seasons)
): ProfitabilityTrendPoint[] {
  
  // Calculate average current performance baseline
  const baselineMargin = historicalPoints.length > 0 
    ? historicalPoints.reduce((acc, curr) => acc + curr.marginPercent, 0) / historicalPoints.length 
    : 52.0;

  const baselineVolume = historicalPoints.length > 0 
    ? historicalPoints.length 
    : 15;

  const baselineRevenue = historicalPoints.length > 0 
    ? historicalPoints.reduce((acc, curr) => acc + curr.revenue, 0) / historicalPoints.length 
    : 38400.0;

  const monthLabels = ['Julho 2026', 'Agosto 2026', 'Setembro 2026', 'Outubro 2026'];
  
  return monthLabels.map((lbl, idx) => {
    // Accumulate structural elements month over month
    const seasonalModifier = 1 + (Math.sin((idx + 1) * 0.8) * demandSeasonalFactor);
    
    // inflation slowly increases product chemical purchase prices (eating net yields)
    const progressiveInflationFactor = 1 + (inflationIndex / 12 * (idx + 1));

    const projectedRevenue = baselineRevenue * seasonalModifier;
    const projectedCosts = (baselineRevenue * (1 - baselineMargin / 100)) * seasonalModifier * progressiveInflationFactor;
    
    const projectedProfit = projectedRevenue - projectedCosts;
    const projectedMargin = projectedRevenue > 0 ? (projectedProfit / projectedRevenue) * 100 : 0;

    // Assess safety trend
    let trendRiskRating: 'STABLE' | 'UPWARD_PROGRESS' | 'DEGRADATION' = 'STABLE';
    if (projectedMargin < baselineMargin - 1.5) {
      trendRiskRating = 'DEGRADATION';
    } else if (projectedMargin > baselineMargin + 1.5) {
      trendRiskRating = 'UPWARD_PROGRESS';
    }

    return {
      period: lbl,
      averageMarginPercent: Number(projectedMargin.toFixed(1)),
      volumeCount: Math.round(baselineVolume * seasonalModifier),
      revenueAmount: Number(projectedRevenue.toFixed(2)),
      costsAmount: Number(projectedCosts.toFixed(2)),
      trendRiskRating
    };
  });
}
