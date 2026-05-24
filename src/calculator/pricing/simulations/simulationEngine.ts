import { PricingSimulationScenario, DetailedOperationalCost, CompositePrice } from '../types';
import { Recurrence } from '@/types/database';

/**
 * Run a multi-variable scenario comparison relative to a control baseline
 */
export function modelAlternativeScenario(
  scenarioLabel: string,
  baselineCost: DetailedOperationalCost,
  baselinePrice: CompositePrice,
  modifications: {
    targetMarginPercent?: number;
    techniciansCount?: number;
    areaModifier?: number;
    recurrence?: Recurrence;
  }
): PricingSimulationScenario {
  const finalMargin = modifications.targetMarginPercent !== undefined 
    ? modifications.targetMarginPercent 
    : baselinePrice.profitMarginSelected;

  const finalTechCount = modifications.techniciansCount !== undefined
    ? modifications.techniciansCount
    : baselineCost.labor.technicianCount;

  const currentRecurrence = modifications.recurrence !== undefined
    ? modifications.recurrence
    : 'Único';

  // Back-calculate scaling cost variations
  const originalLaborTotal = baselineCost.labor.totalLaborCost;
  const recalculatedLabor = (originalLaborTotal / baselineCost.labor.technicianCount) * finalTechCount;
  
  const totalCost = baselineCost.totalOperationCost - originalLaborTotal + recalculatedLabor;

  // Convert desired margin back to selling price
  // Selling Price = Operational Cost / (1 - Desired Margin in Decimal)
  const marginDecimal = finalMargin / 100.0;
  
  let suggestedPrice = totalCost / (1.0 - marginDecimal);
  if (suggestedPrice <= totalCost) {
    suggestedPrice = totalCost + 50; // Safeguard limit
  }

  const netProfit = suggestedPrice - totalCost;

  return {
    id: `sim_scen_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    scenarioLabel,
    inputs: {
      areaSize: 0, // contextually implied
      displacementKm: baselineCost.logistics.distanceKm,
      techniciansCount: finalTechCount,
      targetMarginPercent: finalMargin,
      recurrence: currentRecurrence
    },
    breakdown: {
      totalCost: Number(totalCost.toFixed(2)),
      suggestedPrice: Number(suggestedPrice.toFixed(2)),
      netProfit: Number(netProfit.toFixed(2)),
      marginPercent: Number(finalMargin.toFixed(1))
    },
    isSaved: false
  };
}
