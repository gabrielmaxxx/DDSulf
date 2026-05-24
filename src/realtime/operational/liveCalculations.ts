import { LiveCalculationBreakdown } from '../types';
import { eventBus } from '../events/eventBus';

export interface CalculationInput {
  areaSize: number; // in m²
  pestType: string; // Baratas, Cupins etc.
  complexity: 'Baixa' | 'Média' | 'Alta' | 'Crítica';
  displacementDistance: number; // in km
  laborRatePerDay?: number;
  displacementRatePerKm?: number;
  chemicalCostPerM2?: number; // average chemical price per m²
  appliedMarginPercent?: number;
}

export class LiveCalculationsEngine {
  private static instance: LiveCalculationsEngine;

  public static getInstance(): LiveCalculationsEngine {
    if (!LiveCalculationsEngine.instance) {
      LiveCalculationsEngine.instance = new LiveCalculationsEngine();
    }
    return LiveCalculationsEngine.instance;
  }

  /**
   * Run immediate, non-blocking mathematical evaluation of a quoting proposal
   */
  public compute(input: CalculationInput): LiveCalculationBreakdown {
    const area = input.areaSize || 0;
    const distance = input.displacementDistance || 0;
    const laborBase = input.laborRatePerDay || 180;
    const travelBase = input.displacementRatePerKm || 4.5;
    const chemBase = input.chemicalCostPerM2 || 1.8; // Average material cost
    const margin = input.appliedMarginPercent !== undefined ? input.appliedMarginPercent : 65;

    // 1. Raw Chemical Cost Impact
    let rawChemicalsCost = area * chemBase;
    
    // Safety Alert Rules: Excessive chemical volumes
    if (rawChemicalsCost > 2000 && area < 200) {
      eventBus.publish('financial:margin_leakage', {
        type: 'illegal_dosage',
        message: `ALERTA CRÍTICO: Densidade química de R$ ${(rawChemicalsCost / area).toFixed(2)}/m² excede o teto POPS para controle de ${input.pestType}.`,
        severity: 'high',
      });
    }

    // 2. Travel Expenses
    const displacementCost = distance * 2 * travelBase;

    // 3. Labor Estimation based on complexity and Area size
    let techniciansNeeded = 1;
    if (area > 500) {
      techniciansNeeded = 3;
    } else if (area > 200) {
      techniciansNeeded = 2;
    }

    let estimatedHours = 2;
    switch (input.complexity) {
      case 'Crítica':
        estimatedHours = 8;
        break;
      case 'Alta':
        estimatedHours = 5;
        break;
      case 'Média':
        estimatedHours = 3.5;
        break;
      case 'Baixa':
      default:
        estimatedHours = 2;
        break;
    }

    // Cost formula: tech_rate / 8 hours * hours on site
    const laborCost = techniciansNeeded * ((laborBase / 8) * estimatedHours);

    // 4. Complexity Risk Buffer Premium
    let complexityRiskBuffer = 50; // default medium pad
    if (input.complexity === 'Alta') complexityRiskBuffer = 150;
    if (input.complexity === 'Crítica') complexityRiskBuffer = 350;
    if (input.complexity === 'Baixa') complexityRiskBuffer = 15;

    // 5. Build Base Cost Sum
    const totalCosts = rawChemicalsCost + displacementCost + laborCost + complexityRiskBuffer;

    // 6. Project suggested selling price using standard pricing leverage
    // price = local_cost / (1 - margin / 100)
    const factor = 1 - margin / 100;
    const suggestedSalesPrice = factor > 0 ? totalCosts / factor : totalCosts * 3;

    // 12% standard municipality service tax (ISS/PIS/COFINS)
    const taxAmount = suggestedSalesPrice * 0.12;
    const finalPriceWithTax = suggestedSalesPrice + taxAmount;

    // 7. Net Profit evaluation
    const netProfit = finalPriceWithTax - totalCosts - taxAmount;
    const netMarginPercent = finalPriceWithTax > 0 ? (netProfit / finalPriceWithTax) * 100 : 0;

    const leakageAlertActive = margin < 55;

    // Dynamic warning dispatch on low-performance margins
    if (leakageAlertActive) {
      eventBus.publish('financial:margin_leakage', {
        type: 'low_margin_approved',
        message: `ALERTA DE SEGURANÇA: Margem comercial aplicada (${margin}%) está abaixo do teto de segurança DDSulf (55%).`,
        severity: 'critical',
      });
    }

    const breakdown: LiveCalculationBreakdown = {
      rawChemicalsCost: Math.round(rawChemicalsCost * 100) / 100,
      laborCost: Math.round(laborCost * 100) / 100,
      displacementCost: Math.round(displacementCost * 100) / 100,
      complexityRiskBuffer,
      appliedMarginPercent: margin,
      suggestedSalesPrice: Math.round(suggestedSalesPrice * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      finalPriceWithTax: Math.round(finalPriceWithTax * 100) / 100,
      netMarginPercent: Math.round(netMarginPercent * 10) / 10,
      leakageAlertActive,
    };

    // Emit calculation completion event
    eventBus.publish('operational:chemical_used', { input, breakdown });

    return breakdown;
  }
}

export const liveCalculationsEngine = LiveCalculationsEngine.getInstance();
