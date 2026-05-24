import { DetailedOperationalCost, RuleEngineSettings } from '../types';
import { PestType, EnvironmentType, InfestationLevel, OperationalComplexity, Recurrence } from '@/types/database';
import { ProductCostItem } from '../../types';
import { estimateDurationHours } from '../rules/pricingRules';

/**
 * Calculates chemical compound costs and waste cushions based on total area coverage and infestation factors
 */
export function calculateChemicalCosts(
  areaSizeM2: number,
  pest: PestType,
  infestation: InfestationLevel,
  selectedProducts: ProductCostItem[],
  settings: RuleEngineSettings
): { items: ProductCostItem[]; totalChemicalCost: number; rawCost: number; wasteAdjustment: number } {
  const wasteMultiplier = settings.baseRates.wasteSafetyRatio;
  
  // Custom dosage modifiers based on target pest and infestation severity
  let severityModifier = 1.0;
  if (infestation === 'Alto') severityModifier = 1.25;
  if (infestation === 'Crítico') severityModifier = 1.5;
  if (infestation === 'Baixo') severityModifier = 0.85;

  let pestVolumeModifier = 1.0;
  if (pest === 'Cupins') pestVolumeModifier = 1.4; // heavy localized timber application volumes
  if (pest === 'Ratos') pestVolumeModifier = 0.9;  // rodent bait relies more on fixed unit placements rather than liquid distribution
  
  const dosageScale = severityModifier * pestVolumeModifier;

  const dynamicItems = selectedProducts.map(product => {
    // scale dosage by computed factors
    const derivedDosage = product.dosagePerM2 * dosageScale;
    const estimatedNeededVolume = Number((derivedDosage * areaSizeM2).toFixed(2));
    const finalVolumeForCushion = estimatedNeededVolume * wasteMultiplier;
    const computedCost = Number((finalVolumeForCushion * product.unitCost).toFixed(2));

    return {
      ...product,
      amountUsed: estimatedNeededVolume,
      totalCost: computedCost
    };
  });

  const rawCostSum = dynamicItems.reduce((acc, curr) => acc + (curr.amountUsed * curr.unitCost), 0);
  const totalCostSum = dynamicItems.reduce((acc, curr) => acc + curr.totalCost, 0);
  const wasteCost = totalCostSum - rawCostSum;

  return {
    items: dynamicItems,
    rawCost: Number(rawCostSum.toFixed(2)),
    wasteAdjustment: Number(wasteCost.toFixed(2)),
    totalChemicalCost: Number(totalCostSum.toFixed(2))
  };
}

/**
 * Orchestrates the full, multi-layered costing matrix to compute actual bottom lines
 */
export function processOperationalCosting(
  inputs: {
    areaSize: number;
    pestType: PestType;
    environmentType: EnvironmentType;
    infestationLevel: InfestationLevel;
    complexity: OperationalComplexity;
    displacement: number;
    technicians: number;
    selectedProducts: ProductCostItem[];
  },
  settings: RuleEngineSettings
): DetailedOperationalCost {
  const {
    areaSize,
    pestType,
    environmentType,
    infestationLevel,
    complexity,
    displacement,
    technicians,
    selectedProducts
  } = inputs;

  // 1. Estimate Service Duration in Hours
  const taskHours = estimateDurationHours(areaSize, pestType, complexity, infestationLevel, settings);
  const manHours = taskHours * technicians;

  // 2. Chemical Calculations
  const chemicalCostsOutput = calculateChemicalCosts(areaSize, pestType, infestationLevel, selectedProducts, settings);

  // 3. Logistics Costs (Displacement in km back-&-forth + estimated travel hour impact)
  const logisticsUnitCost = settings.baseRates.costPerKm;
  const rawLogisticsAmt = displacement * logisticsUnitCost;
  
  // Estimate transit slowdown offset (approx 1 hour for every 60 Km transit)
  const estimatedTransitTime = displacement / 60.0;
  
  // 4. Labor Costs
  const technicianHourlyRate = settings.baseRates.hourlyLaborCost;
  const netLaborAmt = manHours * technicianHourlyRate;

  // 5. Overhead and Amortization Assets
  let equipmentAmortization = settings.baseRates.equipmentBaseAmortization;
  // Complex industrial setups require specialised thermal fogging or pressurized vector units
  if (complexity === 'Complexo') {
    equipmentAmortization += 55.0;
  } else if (complexity === 'Normal') {
    equipmentAmortization += 15.0;
  }

  // Risky environmental conditions add buffer weight to asset depreciation (restaurante / hospital)
  let riskFactorCost = 0.0;
  if (environmentType === 'Hospital') riskFactorCost = 45.0; // strict sanitation PPE & bio gear
  if (environmentType === 'Indústria') riskFactorCost = 35.0; // safety harness / physical gear

  const fixedIndirectOverhead = settings.baseRates.fixedOperationalIndirectFee;
  const assetOverheadTotal = equipmentAmortization + riskFactorCost + fixedIndirectOverhead;

  // 6. Consolidate Direct Cost
  const subtotalDirectCost = chemicalCostsOutput.totalChemicalCost + rawLogisticsAmt + netLaborAmt + assetOverheadTotal;

  // 7. Taxes Allocation (Approximating simple enterprise flat corporate tax on raw operational cost equivalent)
  // Standard corporate Simples Nacional is roughly 6% to 12% on revenue.
  // We approximate flat tax burden relative to execution: 9% index.
  const taxRatio = 0.09;
  const taxAmount = subtotalDirectCost * taxRatio;

  const totalOperationCost = subtotalDirectCost + taxAmount;

  return {
    chemicalInsumos: {
      items: chemicalCostsOutput.items,
      rawCost: chemicalCostsOutput.rawCost,
      wasteAdjustment: chemicalCostsOutput.wasteAdjustment,
      totalChemicalCost: chemicalCostsOutput.totalChemicalCost
    },
    logistics: {
      distanceKm: displacement,
      costPerKm: logisticsUnitCost,
      totalLogisticsCost: Number(rawLogisticsAmt.toFixed(2)),
      estimatedTransitTimeHours: Number(estimatedTransitTime.toFixed(2))
    },
    labor: {
      technicianCount: technicians,
      manHoursSpent: Number(manHours.toFixed(2)),
      hourlyCost: technicianHourlyRate,
      totalLaborCost: Number(netLaborAmt.toFixed(2))
    },
    overheadAndAssets: {
      equipmentAmortization: Number(equipmentAmortization.toFixed(2)),
      complexityRiskFactor: Number(riskFactorCost.toFixed(2)),
      indirectOverheadFee: Number(fixedIndirectOverhead.toFixed(2)),
      totalAssetAndOverheadCost: Number(assetOverheadTotal.toFixed(2))
    },
    subtotalDirectCost: Number(subtotalDirectCost.toFixed(2)),
    taxAmount: Number(taxAmount.toFixed(2)),
    totalOperationCost: Number(totalOperationCost.toFixed(2))
  };
}
