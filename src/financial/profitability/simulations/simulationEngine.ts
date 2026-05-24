import { ProfitabilitySimulationScenario } from '../types';

/**
 * Executes high-performance scenarios simulations
 *
 * @param baseDirectCost Original raw variable costs baseline
 * @param baseIndirectOverhead Original administrative rateio
 * @param taxRate Percent index representing tax burdens
 * @param targetMarginPercent Goal margin
 * @param scenariosModifiers List of scenario adjustments to configure
 */
export function simulateFinancialScenarios(
  baseDirectCost: number,
  baseIndirectOverhead: number,
  taxRate: number = 0.09,
  targetMarginPercent: number = 55.0,
  scenariosModifiers: Array<{
    id: string;
    label: string;
    manHoursAdjustment?: number; // multiplier, e.g. 0.8 (20% faster)
    displacementAdjustment?: number; // delta, e.g. -15 Km
    marginTargetAdjustment?: number; // delta, e.g. +5% margin
    recurrenceDiscountOverride?: number; // absolute value
  }>
): ProfitabilitySimulationScenario[] {
  return scenariosModifiers.map(mod => {
    // 1. Resolve simulated direct labor or product savings
    const scaleDirect = mod.manHoursAdjustment !== undefined ? mod.manHoursAdjustment : 1.0;
    const simulatedDirectCost = baseDirectCost * scaleDirect;

    // 2. Resolve simulated logistics adjustments
    const logDelta = mod.displacementAdjustment !== undefined ? mod.displacementAdjustment * 1.85 : 0; // standard Km cost
    const simulatedDirectCostAdjusted = Math.max(15.0, simulatedDirectCost + logDelta);

    // 3. Resolve modified target margins
    const deltaMargin = mod.marginTargetAdjustment !== undefined ? mod.marginTargetAdjustment : 0;
    const rawTargetMargin = targetMarginPercent + deltaMargin;
    const finalSimulatedMargin = Math.max(5.0, Math.min(90.0, rawTargetMargin));

    // 4. Formulate pricing calculations based on the revised cost structure
    // Price = Cost / (1 - Margin% - Tax%)
    const costSubtotal = simulatedDirectCostAdjusted + baseIndirectOverhead;
    const denom = 1 - (finalSimulatedMargin / 100) - taxRate;
    const calculatedPrice = denom > 0.05 ? costSubtotal / denom : costSubtotal / 0.05;

    // Recurrence override if specified
    const discountFactor = mod.recurrenceDiscountOverride !== undefined ? mod.recurrenceDiscountOverride : 0;
    const finalProposedSellingPrice = Math.max(calculatedPrice - discountFactor, costSubtotal);

    // Financial outcomes
    const taxCost = finalProposedSellingPrice * taxRate;
    const profitAmount = finalProposedSellingPrice - costSubtotal - taxCost;
    const realMargin = finalProposedSellingPrice > 0 ? (profitAmount / finalProposedSellingPrice) * 100 : 0;

    let simulatedScore = 55;
    if (realMargin >= targetMarginPercent) {
      simulatedScore = Math.min(100, 75 + Math.round((realMargin - targetMarginPercent) * 2));
    } else {
      simulatedScore = Math.max(10, 70 - Math.round((targetMarginPercent - realMargin) * 3));
    }

    return {
      id: mod.id,
      label: mod.label,
      modifiedVariables: {
        manHoursAdjustment: mod.manHoursAdjustment,
        marginTargetAdjustment: mod.marginTargetAdjustment,
        displacementAdjustment: mod.displacementAdjustment,
        recurrenceDiscountOverride: mod.recurrenceDiscountOverride
      },
      simulationResults: {
        totalDirectCost: Number(simulatedDirectCostAdjusted.toFixed(2)),
        totalIndirectOverhead: Number(baseIndirectOverhead.toFixed(2)),
        taxCost: Number(taxCost.toFixed(2)),
        finalSellingPrice: Number(finalProposedSellingPrice.toFixed(2)),
        profitAmount: Number(profitAmount.toFixed(2)),
        marginPercent: Number(realMargin.toFixed(1)),
        viabilityScore: simulatedScore
      }
    };
  });
}
