import { PestType, EnvironmentType, InfestationLevel, OperationalComplexity } from '@/types/database';
import { FixedCostItem, VariableCostItem, CostAllocationSettings, OperationalCostBreakdown, ProfitabilityMetrics, CostAnomalyAlert } from '../types';
import { getLogisticsRateFromCosts, getEquipmentWearRateFromCosts } from '../costs/variableCostsEngine';
import { allocateIndirectCosts } from '../allocation/allocationEngine';
import { calculateProfitability } from '../profitability/profitabilityEngine';
import { auditOperationalFinances } from '../validations/financialValidator';

export interface FullFinancialComposition {
  costBreakdown: OperationalCostBreakdown;
  profitMetrics: ProfitabilityMetrics;
  alerts: CostAnomalyAlert[];
  complexityIndex: number;
}

/**
 * Computes deep service duration hours based on area size, pest properties and operational factors
 */
export function estimateExecutionDuration(
  areaSizeM2: number,
  pest: PestType,
  complexity: OperationalComplexity,
  infestationLevel: InfestationLevel
): number {
  const areaFactor = areaSizeM2 / 120.0; // 120m² per hour baseline
  let baseHours = 0.8 + areaFactor;

  // Complexity adjustments
  if (complexity === 'Complexo') baseHours *= 1.4;
  if (complexity === 'Simples') baseHours *= 0.8;

  // Pest specific delays (Termite injection takes time, rodent box locks, etc.)
  if (pest === 'Cupins') baseHours *= 1.5;
  if (pest === 'Ratos') baseHours *= 1.15;
  if (pest === 'Escorpiões') baseHours *= 1.25;

  // Infestation adjustments
  if (infestationLevel === 'Crítico') baseHours *= 1.35;
  if (infestationLevel === 'Alto') baseHours *= 1.15;

  // Limit between realistic bounds (45 minutes to 16 hours)
  return Math.min(Math.max(baseHours, 0.75), 16.0);
}

/**
 * Executes high-fidelity multi-attribute costing & margin synthesis for any operation
 */
export function calculateOperationalFinancialComposition(inputs: {
  areaSize: number;
  displacement: number; // Km
  technicians: number;
  pestType: PestType;
  environmentType: EnvironmentType;
  infestationLevel: InfestationLevel;
  complexity: OperationalComplexity;
  targetPriceSelected: number; // dynamic faturamento evaluation base
  selectedProducts: Array<{
    id: string;
    name: string;
    unitCost: number;
    dosagePerM2: number;
    unitLabel: string;
  }>;
  fixedCosts: FixedCostItem[];
  variableCosts: VariableCostItem[];
  allocationSettings: CostAllocationSettings;
}): FullFinancialComposition {
  const {
    areaSize,
    displacement,
    technicians,
    pestType,
    environmentType,
    infestationLevel,
    complexity,
    targetPriceSelected,
    selectedProducts,
    allocationSettings,
    variableCosts
  } = inputs;

  // 1. Durations & Man-Hours Multiplier
  const estimatedHours = estimateExecutionDuration(areaSize, pestType, complexity, infestationLevel);
  const totalManHours = estimatedHours * technicians;

  // 2. Chemical Costs + Waste buffer (10% standard buffer)
  const wasteBufferFactor = 1.10;
  
  // Custom modifiers on chemicals volume
  let pestModifier = 1.0;
  if (pestType === 'Cupins') pestModifier = 1.35;
  if (pestType === 'Ratos') pestModifier = 0.8; // Bait units are discrete placements
  
  let infestationModifier = 1.0;
  if (infestationLevel === 'Crítico') infestationModifier = 1.35;
  if (infestationLevel === 'Alto') infestationModifier = 1.15;
  if (infestationLevel === 'Baixo') infestationModifier = 0.8;

  const resolvedProductsUsed = selectedProducts.map(p => {
    // Volume base on area
    const actualDosage = p.dosagePerM2 * pestModifier * infestationModifier;
    const computedAmt = actualDosage * areaSize;
    const computedAmtWithWaste = computedAmt * wasteBufferFactor;
    const itemCost = computedAmtWithWaste * p.unitCost;

    return {
      productId: p.id,
      name: p.name,
      unitCost: p.unitCost,
      amountUsed: Number(computedAmt.toFixed(2)),
      unitLabel: p.unitLabel,
      totalCost: Number(itemCost.toFixed(2))
    };
  });

  const rawChemicalCost = resolvedProductsUsed.reduce((acc, curr) => acc + (curr.amountUsed * curr.unitCost), 0);
  const totalChemicalCost = resolvedProductsUsed.reduce((acc, curr) => acc + curr.totalCost, 0);
  const chemicalWasteCost = totalChemicalCost - rawChemicalCost;

  // 3. Logistics Costs (fuel per Km + maintenance)
  const derivedKmRate = getLogisticsRateFromCosts(variableCosts);
  const logisticsSum = displacement * derivedKmRate;
  
  // Transit travel hour impact (assuming 60 Km/h average speed)
  const transitHours = displacement / 60.0;

  // 4. Field Labor Costs (using general standard R$45.00 man-hour variable cost baseline)
  const manHourLaborCostRate = 45.0; // R$ per productive hour spent by field tech
  const laborSum = totalManHours * manHourLaborCostRate;

  // 5. Asset Overhead & Amortizations (EPI wear + specialized tools)
  const basicEquipmentWear = getEquipmentWearRateFromCosts(variableCosts);
  let resolvedAmortization = basicEquipmentWear;
  
  if (complexity === 'Complexo') resolvedAmortization += 50.0; // special thermo-fogger amortization
  if (complexity === 'Normal') resolvedAmortization += 15.0;

  // Environment specific biosecurity gear penalty costs
  let biologicalRiskCost = 0.0;
  if (environmentType === 'Hospital') biologicalRiskCost = 45.0; // intensive personal protection equipment
  if (environmentType === 'Indústria') biologicalRiskCost = 30.0; // harness and heavy helmet compliance

  // 6. Proportional Fixed Cost Overhead Allocation
  const allocatedOverhead = allocateIndirectCosts(totalManHours, targetPriceSelected, allocationSettings);

  const subtotalDirectCost = totalChemicalCost + logisticsSum + laborSum;
  const subtotalTotalCost = subtotalDirectCost + allocatedOverhead.allocatedOverheadCost + resolvedAmortization + biologicalRiskCost;

  // 7. Corporate Taxes (simple flat Simples Nacional proportion, standard 9%)
  const flatSimplesNacionalTaxRate = 0.09;
  const finalCalculatedTax = subtotalTotalCost * flatSimplesNacionalTaxRate;
  
  const totalCostFinalTotal = subtotalTotalCost + finalCalculatedTax;

  // Cost matrix report package
  const costBreakdown: OperationalCostBreakdown = {
    chemicalProducts: {
      totalRawCost: Number(rawChemicalCost.toFixed(2)),
      wasteSafetyAdjustment: Number(chemicalWasteCost.toFixed(2)),
      totalCost: Number(totalChemicalCost.toFixed(2)),
      items: resolvedProductsUsed
    },
    logistics: {
      displacementKm: displacement,
      costPerKm: derivedKmRate,
      totalLogisticsCost: Number(logisticsSum.toFixed(2)),
      estimatedTransitHours: Number(transitHours.toFixed(1))
    },
    labor: {
      technicianCount: technicians,
      totalManHoursSpent: Number(totalManHours.toFixed(1)),
      hourlyCostRate: manHourLaborCostRate,
      totalLaborCost: Number(laborSum.toFixed(2))
    },
    indirectAllocation: {
      allocatedOverheadCost: allocatedOverhead.allocatedOverheadCost,
      equipmentAmortization: Number(resolvedAmortization.toFixed(2)),
      complexityRiskFactor: Number(biologicalRiskCost.toFixed(2)),
      indirectFeeTotal: Number((allocatedOverhead.allocatedOverheadCost + resolvedAmortization + biologicalRiskCost).toFixed(2))
    },
    subtotalDirectCost: Number(subtotalDirectCost.toFixed(2)),
    subtotalTotalCost: Number(subtotalTotalCost.toFixed(2)),
    taxAmount: Number(finalCalculatedTax.toFixed(2)),
    totalOperationalCost: Number(totalCostFinalTotal.toFixed(2))
  };

  // 8. Custom Margin Matrices recommendation based on profile boundaries
  let customMarginFloor = 35.0; // 35% standard net margin floor
  let customMarginTarget = 55.0; // 55% average target
  
  if (environmentType === 'Hospital') {
    customMarginFloor += 10.0;
    customMarginTarget += 10.0;
  } else if (environmentType === 'Indústria') {
    customMarginFloor += 5.0;
    customMarginTarget += 8.0;
  } else if (environmentType === 'Residência') {
    customMarginFloor -= 5.0;
    customMarginTarget -= 5.0;
  }

  if (infestationLevel === 'Crítico') {
    customMarginFloor += 5.0;
    customMarginTarget += 5.0;
  }

  // Generate profitability report card
  const profitMetrics = calculateProfitability(
    costBreakdown.totalOperationalCost,
    targetPriceSelected,
    customMarginFloor,
    customMarginTarget,
    flatSimplesNacionalTaxRate
  );

  // 9. Auditing systems anomalies list
  const audits = auditOperationalFinances(costBreakdown, profitMetrics, {
    areaSize,
    techniciansCount: technicians,
    pestType,
    environmentType
  });

  // Numeric index summarizing core complexity weight parameter
  const rawComplexityFactor = (estimatedHours / 2) * (displacement / 50 + 1) * (technicians * 0.8 + 0.2);

  return {
    costBreakdown,
    profitMetrics,
    alerts: audits,
    complexityIndex: Number(rawComplexityFactor.toFixed(2))
  };
}
