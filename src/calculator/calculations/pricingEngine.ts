import { PricingInputs, PricingBreakdown, ProductCostItem } from '../types';
import { PestType, EnvironmentType, InfestationLevel, OperationalComplexity } from '@/types/database';

// Technical standard pest multipliers
export const PEST_FACTORS: Record<PestType, { timeMultiplier: number; chemicalIntensity: number }> = {
  'Baratas': { timeMultiplier: 1.0, chemicalIntensity: 1.0 },
  'Ratos': { timeMultiplier: 1.3, chemicalIntensity: 1.2 },
  'Cupins': { timeMultiplier: 2.5, chemicalIntensity: 2.2 },
  'Formigas': { timeMultiplier: 0.9, chemicalIntensity: 0.95 },
  'Escorpiões': { timeMultiplier: 1.6, chemicalIntensity: 1.4 },
  'Pulgas': { timeMultiplier: 1.4, chemicalIntensity: 1.5 },
  'Mosquitos': { timeMultiplier: 1.2, chemicalIntensity: 1.3 },
  'Percevejos': { timeMultiplier: 1.8, chemicalIntensity: 1.8 },
  'Outros': { timeMultiplier: 1.0, chemicalIntensity: 1.0 }
};

// Regulatory and complexity multipliers based on environments
export const ENVIRONMENT_FACTORS: Record<EnvironmentType, { riskFactor: number; overheadFactor: number }> = {
  'Residência': { riskFactor: 1.0, overheadFactor: 1.0 },
  'Comércio': { riskFactor: 1.2, overheadFactor: 1.15 },
  'Indústria': { riskFactor: 1.8, overheadFactor: 1.4 },
  'Restaurante': { riskFactor: 1.5, overheadFactor: 1.3 },
  'Condomínio': { riskFactor: 1.4, overheadFactor: 1.25 },
  'Hospital': { riskFactor: 2.0, overheadFactor: 1.5 },
  'Área Externa': { riskFactor: 1.0, overheadFactor: 1.0 }
};

export const INFESTATION_POWER: Record<InfestationLevel, { time: number; dosage: number }> = {
  'Baixo': { time: 0.8, dosage: 0.8 },
  'Médio': { time: 1.0, dosage: 1.0 },
  'Alto': { time: 1.4, dosage: 1.4 },
  'Crítico': { time: 2.2, dosage: 2.0 }
};

export const COMPLEXITY_RATES: Record<OperationalComplexity, number> = {
  'Normal': 1.0,
  'Simples': 0.8,
  'Complexo': 1.5
};

export interface PricingEngineSettings {
  costPerHour: number;
  costPerKm: number;
  baseOperationalCost: number;
  indirectOverheadRate: number; // e.g. 15% (0.15) of direct costs
  targetMarginDefault: number; // e.g. 60%
  baseEquipmentAmortization: number; // static wear & tear cost
}

export const DEFAULT_ENGINE_SETTINGS: PricingEngineSettings = {
  costPerHour: 45,
  costPerKm: 2.4,
  baseOperationalCost: 75,
  indirectOverheadRate: 0.15,
  targetMarginDefault: 60, // SaaS-like highly profitable target margin
  baseEquipmentAmortization: 35
};

/**
 * Calculates estimated hours to treat an area
 */
export function estimateDurationHours(
  areaSize: number,
  pestType: PestType,
  complexity: OperationalComplexity,
  infestation: InfestationLevel
): number {
  const baseRate = 1 / 150; // default 1 hour per 150m²
  let duration = areaSize * baseRate;
  
  // Apply multipliers
  duration *= PEST_FACTORS[pestType]?.timeMultiplier ?? 1.0;
  duration *= COMPLEXITY_RATES[complexity] ?? 1.0;
  duration *= INFESTATION_POWER[infestation]?.time ?? 1.0;
  
  // Minimum treatment window is 0.75 hours (45 min)
  return Math.max(0.75, Math.round(duration * 100) / 100);
}

/**
 * Calculates standard chemical usage based on defaults if custom chemicals are loaded or empty
 */
export function computeChemicalCosts(
  areaSize: number,
  pestType: PestType,
  infestation: InfestationLevel,
  customProducts?: ProductCostItem[]
): { totalChemicalCost: number; items: ProductCostItem[] } {
  if (customProducts && customProducts.length > 0) {
    // Process custom selection with reactive calculations
    const items = customProducts.map(prod => {
      const pestIntensity = PEST_FACTORS[pestType]?.chemicalIntensity ?? 1.0;
      const infestDosage = INFESTATION_POWER[infestation]?.dosage ?? 1.0;
      const dosageMult = pestIntensity * infestDosage;
      
      const amt = areaSize * prod.dosagePerM2 * dosageMult;
      const cost = amt * prod.unitCost;
      return {
        ...prod,
        amountUsed: Math.round(amt * 10) / 10,
        totalCost: Math.round(cost * 100) / 100
      };
    });

    const totalChemicalCost = items.reduce((acc, curr) => acc + curr.totalCost, 0);
    return { totalChemicalCost, items };
  }

  // Fallback default chemical products standard definition
  const defaults: Record<PestType, string> = {
    'Baratas': 'K-Othrine Gel & Deltametrina EC',
    'Ratos': 'Raticida Grão & Bloco Parafinado',
    'Cupins': 'Termicida Fipronil Concentrado',
    'Formigas': 'Gel Formicida & Bifentrina',
    'Escorpiões': 'Fendona Pro Suspensão',
    'Pulgas': 'Inibidor de Crescimento lufenuron',
    'Mosquitos': 'Adulticida Lambdacialotrina',
    'Percevejos': 'Temprid Multi-Action',
    'Outros': 'Inseticida Clorpirifós'
  };

  const name = defaults[pestType] || 'Inseticida Padrão DDSulf';
  const pestIntensity = PEST_FACTORS[pestType]?.chemicalIntensity ?? 1.0;
  const infestDosage = INFESTATION_POWER[infestation]?.dosage ?? 1.0;
  
  // average price of chemicals is around R$ 0.15 per m²
  const baseCostPerM2 = 0.18;
  const finalCostM2 = baseCostPerM2 * pestIntensity * infestDosage;
  const chemicalCost = areaSize * finalCostM2;

  const defaultItem: ProductCostItem = {
    id: `def_${pestType}`,
    name,
    dosagePerM2: pestType === 'Cupins' ? 5.0 : 2.0,
    unitCost: finalCostM2 / (pestType === 'Cupins' ? 5.0 : 2.0),
    unitLabel: 'ml',
    amountUsed: areaSize * (pestType === 'Cupins' ? 5.2 : 2.0),
    totalCost: Math.round(chemicalCost * 100) / 100
  };

  return {
    totalChemicalCost: Math.round(chemicalCost * 100) / 100,
    items: [defaultItem]
  };
}

/**
 * Computes entire pricing breakdown based on active settings
 */
export function processOperationalPricing(
  inputs: PricingInputs,
  settings: PricingEngineSettings = DEFAULT_ENGINE_SETTINGS
): PricingBreakdown {
  const { areaSize, pestType, environmentType, complexity, infestationLevel, displacement, technicians, recurrence, customMargin } = inputs;
  
  // 1. Calculate operational variables
  const estimatedTimeHours = estimateDurationHours(areaSize, pestType, complexity, infestationLevel);
  
  // 2. Direct Costs
  const chemicalsData = computeChemicalCosts(areaSize, pestType, infestationLevel, inputs.selectedProducts);
  const directLaborCost = technicians * estimatedTimeHours * settings.costPerHour;
  const displacementCost = displacement * settings.costPerKm;
  const equipmentsCost = settings.baseEquipmentAmortization + (complexity === 'Complexo' ? 25 : 0);
  const baseOverhead = settings.baseOperationalCost;

  // 3. Total Operational Direct Cost
  const directCostsOnly = directLaborCost + displacementCost + chemicalsData.totalChemicalCost + equipmentsCost + baseOverhead;
  
  // 4. Indirect Overhead (finance, operational backup, safety)
  const envOverheadFactor = (ENVIRONMENT_FACTORS[environmentType]?.overheadFactor ?? 1.0) - 1.0;
  const totalIndirectOverheadRate = settings.indirectOverheadRate + envOverheadFactor;
  const indirectOverheadCost = directCostsOnly * totalIndirectOverheadRate;
  
  const totalOperationalCost = Math.round((directCostsOnly + indirectOverheadCost) * 100) / 100;

  // 5. Margin Determination
  // Use customMargin if provided (scenario simulation), otherwise fallback to config default
  const targetMargin = (customMargin !== undefined ? customMargin : settings.targetMarginDefault) / 100;
  
  // Prevent division by zero if targetMargin is 100% or more
  const billingFactor = targetMargin >= 1 ? 0.05 : 1 - targetMargin;
  
  // Base calculated price before urgencies and recurring discounts
  let calculatedPrice = totalOperationalCost / billingFactor;

  // Apply environment risk premium
  const riskMult = ENVIRONMENT_FACTORS[environmentType]?.riskFactor ?? 1.0;
  calculatedPrice *= riskMult;

  // Apply application frequencies discount/adjustment
  let frequencyDiscount = 0;
  if (recurrence === 'Mensal') frequencyDiscount = 0.20; // 20% recurrency optimization
  if (recurrence === 'Trimestral') frequencyDiscount = 0.12; 
  if (recurrence === 'Semestral') frequencyDiscount = 0.06;

  calculatedPrice *= (1 - frequencyDiscount);

  // Apply urgency priority adjustment
  let urgencyPremium = 1.0;
  if (inputs.urgency === 'Prioritário') urgencyPremium = 1.15;
  if (inputs.urgency === 'Emergência') urgencyPremium = 1.35; // 35% premium for night/urgent responses

  let suggestedPrice = Math.round(calculatedPrice * urgencyPremium);

  // Hard floor: break even price is the raw operational costs with zero margin
  const breakEvenPrice = totalOperationalCost;
  
  // Never charge below break-even + 15% floor to avoid immediate operational loss
  if (suggestedPrice < breakEvenPrice * 1.15) {
    suggestedPrice = Math.round(breakEvenPrice * 1.15);
  }

  // Recalculate true actual margin percentage
  const profitAmount = suggestedPrice - totalOperationalCost;
  const actualMarginPercent = suggestedPrice > 0 ? (profitAmount / suggestedPrice) * 100 : 0;

  return {
    directLaborCost: Math.round(directLaborCost * 100) / 100,
    displacementCost: Math.round(displacementCost * 100) / 100,
    chemicalsCost: Math.round(chemicalsData.totalChemicalCost * 100) / 100,
    indirectOverheadCost: Math.round(indirectOverheadCost * 100) / 100,
    equipmentsCost: Math.round(equipmentsCost * 100) / 100,
    totalOperationalCost,
    suggestedPrice,
    actualMarginPercent,
    profitAmount: Math.round(profitAmount * 100) / 100,
    estimatedTimeHours,
    breakEvenPrice: Math.round(breakEvenPrice * 100) / 100
  };
}
