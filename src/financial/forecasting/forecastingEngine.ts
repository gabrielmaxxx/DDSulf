import { FinancialForecastMetrics } from '../types';

/**
 * Models forward-looking operational revenue margins and lists predictive cost optimizations
 *
 * @param historicalRevenue Monthly baseline income sum
 * @param directCostsRatio Proportion of expenses that vary with growth (e.g., 0.35)
 * @param fixedCostsAmount Total administrative overhead to cover
 * @param growthModifier Expected growth scalar (e.g., +12% = 0.12)
 * @param inflationRisk Expected chemical/fuel inflation index (e.g., +5% = 0.05)
 */
export function processPredictiveFinancialForecast(
  historicalRevenue: number,
  directCostsRatio: number,
  fixedCostsAmount: number,
  growthModifier: number = 0.10,
  inflationRisk: number = 0.04
): FinancialForecastMetrics[] {
  const forecasts: FinancialForecastMetrics[] = [];
  const monthlyNames = ['Próximo Mês (M+1)', 'Mês Seguido (M+2)', 'Mês Planejado (M+3)'];

  let baseRevenue = historicalRevenue > 0 ? historicalRevenue : 45000.0;
  let baseDirectCosts = baseRevenue * (directCostsRatio > 0 ? directCostsRatio : 0.40);
  let baseFixedOverhead = fixedCostsAmount > 0 ? fixedCostsAmount : 12000.0;

  for (let i = 0; i < 3; i++) {
    // Accumulate compound growth and inflation factors
    const compoundGrowth = Math.pow(1 + growthModifier, i + 1);
    const compoundInflation = Math.pow(1 + inflationRisk, i + 1);

    const projectedRevenue = baseRevenue * compoundGrowth;
    const projectedDirectCosts = baseDirectCosts * compoundGrowth * compoundInflation;
    const projectedCosts = projectedDirectCosts + baseFixedOverhead;
    const projectedProfit = projectedRevenue - projectedCosts;

    // IA tips generation dynamically responding to input parameters
    let optimizationTip = 'Margens sustentáveis observadas. Mantenha as taxas de rateio atuais.';
    let savingsAmount = 0;
    let targetCategory = 'Geral';

    if (projectedCosts / projectedRevenue > 0.65) {
      targetCategory = 'Logística';
      savingsAmount = Number((projectedDirectCosts * 0.15).toFixed(2));
      optimizationTip = 'Custos diretos operacionais elevados. Ative a roteirização do DDSulf para reduzir rotas redundantes e economizar cerca de 15% de combustível.';
    } else if (projectedDirectCosts > 15000) {
      targetCategory = 'Químicos';
      savingsAmount = Number((projectedDirectCosts * 0.08).toFixed(2));
      optimizationTip = 'Consumo estimado de defensivos químicos em escala. Centralize compras direto da fabricante para obter descontos comerciais em lote de até 8%.';
    } else {
      targetCategory = 'Alocação Administrativa';
      savingsAmount = Number((baseFixedOverhead * 0.05).toFixed(2));
      optimizationTip = 'Estrutura operacional otimizada. Utilize os dados de tempo de execução da IA para calibrar as taxas de rateio de tempo individual dos técnicos.';
    }

    const previousProfit = i === 0 ? baseRevenue - (baseDirectCosts + baseFixedOverhead) : forecasts[i - 1].projectedProfit;
    const trend: 'UP' | 'DOWN' | 'STABLE' = projectedProfit > previousProfit + 100 
      ? 'UP' 
      : projectedProfit < previousProfit - 100 
        ? 'DOWN' 
        : 'STABLE';

    forecasts.push({
      period: monthlyNames[i],
      projectedRevenue: Number(projectedRevenue.toFixed(2)),
      projectedCosts: Number(projectedCosts.toFixed(2)),
      projectedProfit: Number(projectedProfit.toFixed(2)),
      marginTrend: trend,
      aiSavingsRecommendation: {
        estimatedSavings: savingsAmount,
        tip: optimizationTip,
        targetCategory
      }
    });
  }

  return forecasts;
}
