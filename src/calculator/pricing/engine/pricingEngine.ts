import { DetailedOperationalCost, CompositePrice, PricingAnalyticsMetrics, RuleEngineSettings } from '../types';
import { PestType, EnvironmentType, InfestationLevel, OperationalComplexity, Recurrence } from '@/types/database';
import { DEFAULT_RULE_SETTINGS, getCompositeMultiplier, getExpectedLTVDurationMonths } from '../rules/pricingRules';
import { processOperationalCosting } from '../operational/costingEngine';
import { calculateRecommendedMargins } from '../margin/marginEngine';

export interface FullPricingCalculationOutput {
  inputs: {
    areaSize: number;
    pestType: PestType;
    environmentType: EnvironmentType;
    infestationLevel: InfestationLevel;
    complexity: OperationalComplexity;
    displacementKm: number;
    techniciansCount: number;
    customMarginPercent?: number;
    recurrence: Recurrence;
  };
  costing: DetailedOperationalCost;
  pricing: CompositePrice;
  analytics: PricingAnalyticsMetrics;
}

/**
 * Triggers the complete financial modeling logic
 */
export function calculatePricingStructure(
  inputs: {
    areaSize: number;
    pestType: PestType;
    environmentType: EnvironmentType;
    infestationLevel: InfestationLevel;
    complexity: OperationalComplexity;
    displacement: number;
    technicians: number;
    recurrence: Recurrence;
    customMargin?: number;
    selectedProducts: any[];
  },
  settings: RuleEngineSettings = DEFAULT_RULE_SETTINGS
): FullPricingCalculationOutput {
  const {
    areaSize,
    pestType,
    environmentType,
    infestationLevel,
    complexity,
    displacement,
    technicians,
    recurrence,
    customMargin,
    selectedProducts
  } = inputs;

  // 1. Process Raw Operational Costing
  const costing = processOperationalCosting(
    {
      areaSize,
      pestType,
      environmentType,
      infestationLevel,
      complexity,
      displacement,
      technicians,
      selectedProducts
    },
    settings
  );

  // 2. Fetch Margin Matrix Requirements
  const marginMatrix = calculateRecommendedMargins(environmentType, complexity, infestationLevel);

  // Determine active target margin percentage
  // If the user specifies a custom margin via a manual override slider, prioritize it.
  // Otherwise, fallback to the recommended target margin.
  const activeMarginPercent = customMargin !== undefined ? customMargin : marginMatrix.targetMarginPercent;

  // 3. Compute Selling Price structures
  // Break-even is direct cost + flat enterprise taxes on breakeven proportion
  const breakEvenPrice = costing.totalOperationCost;

  // Selling Price = Operational Cost / (1.0 - Active Margin)
  const marginDecimal = activeMarginPercent / 100.0;
  let suggestedPrice = costing.subtotalDirectCost / (1.0 - marginDecimal);

  // Enforce zero division safeguard
  if (suggestedPrice <= costing.subtotalDirectCost) {
    suggestedPrice = costing.subtotalDirectCost + 100;
  }

  // Recurrence modifications: Give subscription discount on original calculated price
  const recurrenceMultiplier = settings.multipliers.recurrences[recurrence];
  const priceAfterRecurrenceAdjustment = suggestedPrice * recurrenceMultiplier;

  // Floor Price constraint based on recommended minimum margin to execute
  const floorMarginDecimal = marginMatrix.minimumMarginPercent / 100.0;
  const minPriceOfService = costing.subtotalDirectCost / (1.0 - floorMarginDecimal);

  // 4. Recalculate Final Profit margins
  const netRevenue = priceAfterRecurrenceAdjustment;
  const profitAmount = netRevenue - costing.totalOperationCost;
  const realizedMargin = netRevenue > 0 ? (profitAmount / netRevenue) * 100 : 0;

  const taxesTotal = costing.taxAmount;

  const pricing: CompositePrice = {
    baseOperationalCost: costing.subtotalDirectCost,
    breakEvenPrice: Number(breakEvenPrice.toFixed(2)),
    suggestedPrice: Number(priceAfterRecurrenceAdjustment.toFixed(2)),
    minPermittedPrice: Number(minPriceOfService.toFixed(2)),
    riskPremiumAmount: Number((costing.subtotalDirectCost * (marginMatrix.riskPremiumPercent / 100.0)).toFixed(2)),
    taxesTotal: Number(taxesTotal.toFixed(2)),
    profitMarginSelected: activeMarginPercent,
    actualMarginPercent: Number(realizedMargin.toFixed(1)),
    actualNetProfitAmount: Number(profitAmount.toFixed(2))
  };

  // 5. Package Analytics telemetry
  let dealSizeCategory: 'Pequeno' | 'Médio' | 'Grande' | 'Enterprise' = 'Pequeno';
  if (areaSize > 1500 || pricing.suggestedPrice > 4000) {
    dealSizeCategory = 'Enterprise';
  } else if (areaSize > 750 || pricing.suggestedPrice > 1500) {
    dealSizeCategory = 'Grande';
  } else if (areaSize > 250 || pricing.suggestedPrice > 600) {
    dealSizeCategory = 'Médio';
  }

  const durationMonths = getExpectedLTVDurationMonths(recurrence);
  // Recurring LTV Projection
  const estimatedLTV = recurrence === 'Único' 
    ? pricing.suggestedPrice 
    : pricing.suggestedPrice * durationMonths;

  const compositeComplexityIndex = getCompositeMultiplier(pestType, environmentType, infestationLevel, complexity, 'Normal', settings);

  // Simple Predictive intelligence tip for future training
  let confidence = 0.85;
  let recommendedMarginDelta = 0.0;
  let suggestionTip = 'Margem consistente com as médias históricas regionais da Sede.';

  if (environmentType === 'Restaurante' && realizedMargin < 50) {
    recommendedMarginDelta = 5;
    suggestionTip = 'Restaurantes têm altas taxas de inspeção sanitária complementar. Recomenda-se elevar a margem para cobrir visitas técnicas gratuitas.';
  } else if (displacement > 100) {
    confidence = 0.72;
    suggestionTip = 'Alta quilometragem fora da sub-sede aumenta risco de atraso na agenda. Considere agrupar mais visitas ou adiar a rota.';
  }

  const analytics: PricingAnalyticsMetrics = {
    version: 'DDSulf-PE-v4',
    timestamp: new Date().toISOString(),
    dealSizeCategory,
    estimatedLTV,
    contractPeriodMonths: durationMonths,
    operationalComplexityIndex: Number(compositeComplexityIndex.toFixed(2)),
    geographyCoefficient: Number((displacement / 100).toFixed(2)),
    futureIARecommendation: {
      confidenceScore: confidence,
      suggestedMarginDelta: recommendedMarginDelta,
      optimizationTip: suggestionTip
    }
  };

  return {
    inputs: {
      areaSize,
      pestType,
      environmentType,
      infestationLevel,
      complexity,
      displacementKm: displacement,
      techniciansCount: technicians,
      customMarginPercent: customMargin,
      recurrence
    },
    costing,
    pricing,
    analytics
  };
}
