import { EnvironmentType, OperationalComplexity, Recurrence } from '@/types/database';
import { MarginIntelligenceConfig, DetailedOperationalMargin } from '../types';

export const DEFAULT_MARGIN_CONFIG: MarginIntelligenceConfig = {
  id: 'standard_margin_v1',
  minAcceptableMargin: 35.0, // Floor Net Margin
  targetMargin: 55.0,        // Target Net Margin
  eliteMargin: 70.0,         // Elite Contract Goal
  riskPremiumModifiers: {
    complexity: {
      'Simples': -5.0,
      'Normal': 0.0,
      'Complexo': 10.0
    },
    environment: {
      'Residência': -5.0,
      'Comércio': 0.0,
      'Indústria': 7.5,
      'Restaurante': 5.0,
      'Condomínio': 5.0,
      'Hospital': 12.0,
      'Área Externa': 2.5
    }
  },
  recurrenceDiscountModifiers: {
    'Único': 0.0,
    'Mensal': -10.0,     // highly stable monthly contracts can tolerate a lower margin floor
    'Trimestral': -5.0,
    'Semestral': -2.5,
    'Anual': 0.0
  },
  isDefault: true,
  updatedAt: new Date().toISOString()
};

/**
 * High-fidelity calculations of real margins considering various operational risks.
 */
export function calculateDetailedOperationalMargins(inputs: {
  sellingPrice: number;
  directCosts: number;    // chemical products, direct labor, fuel
  indirectCosts: number;  // overhead rateio, machinery depreciation
  displacementKm: number;
  complexity: OperationalComplexity;
  environment: EnvironmentType;
  recurrence: Recurrence;
  config: MarginIntelligenceConfig;
}): DetailedOperationalMargin {
  const { sellingPrice, directCosts, indirectCosts, displacementKm, complexity, environment, recurrence, config } = inputs;

  const totalBaseCost = directCosts + indirectCosts;
  
  // Real flat tax deduction baseline (standard Simples Nacional flat rate ~9%)
  const flatTaxRate = 0.09;
  const taxesPaid = sellingPrice * flatTaxRate;

  // Real Net Income after accounting for all execution costs and proportional tax obligations
  const netProfit = sellingPrice - totalBaseCost - taxesPaid;

  // Gross Margin Percent (Before corporate overhead, but after physical operational costs)
  const grossMarginPercent = sellingPrice > 0 
    ? ((sellingPrice - directCosts) / sellingPrice) * 100 
    : 0;

  // Net Margin Percent
  const netMarginPercent = sellingPrice > 0 
    ? (netProfit / sellingPrice) * 100 
    : 0;

  // 1. Complexity margin penalty factor (Operational slowdown, extra compliance overhead)
  const compPenaltyModifier = config.riskPremiumModifiers.complexity[complexity] || 0;
  const complexityPenaltyPercent = compPenaltyModifier > 0 ? Number(compPenaltyModifier.toFixed(1)) : 0;

  // 2. Unproductivity Buffer (representing technician idle hours or weather delays)
  const unproductiveBufferPercent = complexity === 'Complexo' ? 4.5 : 2.0;

  // 3. Logistics degradation metric
  // If truck travels more than 100km, transit hours and tire wear eat margin yields
  const logisticsDegradationRate = displacementKm > 80 
    ? ((displacementKm - 80) * 0.15) 
    : 0;

  // Calculates Risk-Adjusted Margin taking into account environmental compliance, logistical degradation and complexity factors
  const envMod = config.riskPremiumModifiers.environment[environment] || 0;
  const recurrenceMod = config.recurrenceDiscountModifiers[recurrence] || 0;

  const resolvedMarginFloor = config.minAcceptableMargin + envMod + compPenaltyModifier + recurrenceMod;

  // Adjusted margin reflects real Net Margin after potential operational slippage buffers
  const slippageDeductions = (complexityPenaltyPercent * 0.3) + unproductiveBufferPercent + logisticsDegradationRate;
  const riskAdjustedMarginPercent = netMarginPercent - slippageDeductions;

  // Calculate high-fidelity Break-Even pricing floor
  const breakEvenThresholdPrice = totalBaseCost / (1 - flatTaxRate);

  return {
    grossMarginPercent: Number(Math.max(0, Math.min(100, grossMarginPercent)).toFixed(1)),
    netMarginPercent: Number(Math.max(-100, Math.min(100, netMarginPercent)).toFixed(1)),
    riskAdjustedMarginPercent: Number(Math.max(-100, Math.min(100, riskAdjustedMarginPercent)).toFixed(1)),
    complexityPenaltyPercent,
    unproductivityBufferPercent: unproductiveBufferPercent,
    displacementDegradationPercent: Number(Math.max(0, logisticsDegradationRate).toFixed(1)),
    actualNetProfitAmount: Number(netProfit.toFixed(2)),
    breakEvenThresholdPrice: Number(breakEvenThresholdPrice.toFixed(2))
  };
}
