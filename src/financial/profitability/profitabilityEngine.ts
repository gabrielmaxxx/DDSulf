import { ProfitabilityMetrics } from '../types';

/**
 * Calculates profitability metrics, margins and executes risk assessment
 * 
 * @param executionCosts The sum of direct + indirect allocated costs
 * @param selectedPrice The proposed price to evaluate
 * @param minimumMarginPercent Recommended margin floor
 * @param targetMarginPercent Recommended target margin
 * @param taxRate Simple flat tax rate (e.g. 0.09 for 9%)
 */
export function calculateProfitability(
  executionCosts: number,
  selectedPrice: number,
  minimumMarginPercent: number,
  targetMarginPercent: number,
  taxRate: number = 0.09
): ProfitabilityMetrics {
  
  // Taxes are paid on gross faturamento (selling price)
  const totalTaxAmount = selectedPrice * taxRate;
  const breakEvenPrice = executionCosts / (1 - taxRate);

  // Profit amount = Selling Price - Execution Costs - Taxes
  const profitAmount = selectedPrice - executionCosts - totalTaxAmount;
  
  // Margem Bruta = (SelectedPrice - ExecutionCosts) / SelectedPrice
  const grossMarginPercent = selectedPrice > 0 
    ? ((selectedPrice - executionCosts) / selectedPrice) * 100 
    : 0;

  // Margem Líquida = ProfitAmount / SelectedPrice
  const netMarginPercent = selectedPrice > 0 
    ? (profitAmount / selectedPrice) * 100 
    : 0;

  // Risk Classification
  let riskCoefficient: 'CRÍTICO' | 'ALERTA_BAIXO' | 'OTIMIZADO' | 'EXCELENTE' = 'OTIMIZADO';
  if (netMarginPercent < minimumMarginPercent) {
    riskCoefficient = 'CRÍTICO';
  } else if (netMarginPercent < targetMarginPercent) {
    riskCoefficient = 'ALERTA_BAIXO';
  } else if (netMarginPercent > (targetMarginPercent + 15)) {
    riskCoefficient = 'EXCELENTE';
  }

  // Minimum Permitted Selling Price based on the recommended floor margin
  const minPermittedPrice = executionCosts / (1 - (minimumMarginPercent / 100) - taxRate);

  // Calculate high-fidelity Viability Score (0 - 100)
  // Evaluated based on how close it is to target margins + tax stability
  let viabilityScore = 50; // default baseline
  
  if (netMarginPercent >= targetMarginPercent) {
    viabilityScore = Math.min(100, 75 + Math.round((netMarginPercent - targetMarginPercent) * 1.5));
  } else {
    const marginMarginDelta = targetMarginPercent - netMarginPercent;
    viabilityScore = Math.max(0, 75 - Math.round(marginMarginDelta * 2.5));
  }

  // Deduct viability score for extreme high direct cost ratios
  if (riskCoefficient === 'CRÍTICO') {
    viabilityScore = Math.min(viabilityScore, 30);
  }

  return {
    sellingPrice: Number(selectedPrice.toFixed(2)),
    breakEvenPrice: Number(breakEvenPrice.toFixed(2)),
    minPermittedPrice: Number(minPermittedPrice.toFixed(2)),
    profitAmount: Number(profitAmount.toFixed(2)),
    grossMarginPercent: Number(grossMarginPercent.toFixed(1)),
    netMarginPercent: Number(netMarginPercent.toFixed(1)),
    riskCoefficient,
    viabilityScore
  };
}
