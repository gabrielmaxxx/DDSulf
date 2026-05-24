import { Quote, FinancialCost, Revenue, HistoricalInsight } from '@/types/database';
import { FinancialAggregations, HistoricalTrendPoint, OperationalInsight, AnomalyLog } from '../types';
import { differenceInDays, format, subDays, parseISO } from 'date-fns';

/**
 * Calculates essential financial intelligence metrics
 */
export function calculateFinancials(
  revenues: Revenue[],
  costs: FinancialCost[],
  quotes: Quote[]
): FinancialAggregations {
  const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0);
  const totalCosts = costs.reduce((sum, c) => sum + c.amount, 0);
  
  // EBITDA = Revenue - Operational Costs (excluding interest, taxes, etc. simplified)
  // Here, costs can include fixed and operational variable components.
  const ebitda = totalRevenue - totalCosts;
  
  const netMargin = totalRevenue - totalCosts;
  const marginPercent = totalRevenue > 0 ? (netMargin / totalRevenue) * 100 : 0;
  
  const approvedQuotesCount = quotes.filter(q => q.status === 'Aprovado' || q.status === 'Executado').length;
  const averageTicket = approvedQuotesCount > 0 ? totalRevenue / approvedQuotesCount : (revenues.length > 0 ? totalRevenue / revenues.length : 0);

  return {
    totalRevenue,
    totalCosts,
    ebitda,
    netMargin,
    marginPercent,
    averageTicket,
    customerLifetimeValue: averageTicket * 1.5 // Multiplier of typical pest control recurrence
  };
}

/**
 * Maps incoming collections down to historical chart trend data
 */
export function buildHistoricalTrends(
  revenues: Revenue[],
  costs: FinancialCost[],
  daysCount: number = 7
): HistoricalTrendPoint[] {
  const trendMap = new Map<string, { revenue: number; costs: number; count: number }>();
  
  // Generate dates range
  const today = new Date();
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = subDays(today, i);
    const dateStr = format(d, 'yyyy-MM-dd');
    trendMap.set(dateStr, { revenue: 0, costs: 0, count: 0 });
  }

  // Populate revenues
  revenues.forEach(r => {
    try {
      const dateStr = format(parseISO(r.receivedAt), 'yyyy-MM-dd');
      if (trendMap.has(dateStr)) {
        const val = trendMap.get(dateStr)!;
        val.revenue += r.amount;
        val.count += 1;
      }
    } catch (e) {
      // safe fallback
    }
  });

  // Populate costs
  costs.forEach(c => {
    try {
      const dateStr = format(parseISO(c.createdAt), 'yyyy-MM-dd');
      if (trendMap.has(dateStr)) {
        const val = trendMap.get(dateStr)!;
        val.costs += c.amount;
      }
    } catch (e) {
      // safe fallback
    }
  });

  const res: HistoricalTrendPoint[] = [];
  trendMap.forEach((v, k) => {
    const rawMargin = v.revenue - v.costs;
    const marginPercent = v.revenue > 0 ? (rawMargin / v.revenue) * 100 : 0;
    
    // Formatting label for the chart axis
    const parts = k.split('-');
    const label = `${parts[2]}/${parts[1]}`;

    res.push({
      date: label,
      revenue: v.revenue,
      costs: v.costs,
      marginPercent,
      servicesExecuted: v.count
    });
  });

  return res;
}

/**
 * Pattern-based intelligence algorithm generating alerts and anomalies
 */
export function runOperationalAudit(
  quotes: Quote[],
  costs: FinancialCost[],
  revenues: Revenue[]
): { insights: OperationalInsight[]; anomalies: AnomalyLog[] } {
  const insights: OperationalInsight[] = [];
  const anomalies: AnomalyLog[] = [];
  
  const timestamp = new Date().toISOString();

  // 1. Audit Margins (Under-pricing Anomaly Search)
  const lowMarginQuotes = quotes.filter(q => q.status === 'Aprovado' && q.estimatedMargin < 30);
  if (lowMarginQuotes.length > 0) {
    anomalies.push({
      id: `anom_margin_${Date.now()}`,
      severity: 'high',
      title: 'Déficit de Margem Crítico',
      message: `Identificados ${lowMarginQuotes.length} orçamentos ativos operando abaixo do limite regulado pela diretoria (30%).`,
      timestamp,
      resolved: false
    });
  }

  // 2. Variable Cost Spikes (Efficiency Recommendation)
  const variableCosts = costs.filter(c => c.category === 'Variável');
  const totalVar = variableCosts.reduce((sum, c) => sum + c.amount, 0);
  const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0);
  
  if (totalRevenue > 0 && (totalVar / totalRevenue) > 0.4) {
    insights.push({
      id: `ins_cost_vars_${Date.now()}`,
      category: 'financial',
      title: 'Impacto Elevado de Custos Variáveis',
      recommendation: 'As despesas variáveis excedem 40% do faturamento. Considere renegociar fornecedores ou reduzir trajetos veiculares acumulando visitas.',
      impactPercent: 8.5,
      confidenceScore: 0.94,
      associatedDataPoints: variableCosts.length,
      timestamp
    });
  }

  // 3. Pest Density recommendations (Supply calibration)
  const pestDensities: Record<string, number> = {};
  quotes.forEach(q => {
    pestDensities[q.pestType] = (pestDensities[q.pestType] || 0) + 1;
  });

  const highestPest = Object.entries(pestDensities).sort((a,b) => b[1] - a[1])[0];
  if (highestPest && highestPest[1] > quotes.length * 0.4) {
    insights.push({
      id: `ins_supply_opt_${Date.now()}`,
      category: 'supply',
      title: `Consumo Elevado para ${highestPest[0]}`,
      recommendation: `Serviços para ${highestPest[0]} dominam a demanda operacional atual. Recomendamos ajustar o volume de compras preventivas e o estoque regulador correspondente.`,
      impactPercent: 12.0,
      confidenceScore: 0.91,
      associatedDataPoints: highestPest[1],
      timestamp
    });
  }

  return { insights, anomalies };
}
