import { MarginMatrix } from '../types';
import { EnvironmentType, OperationalComplexity, InfestationLevel } from '@/types/database';

/**
 * Computes the recommended target and floor margins for a deal based on structural traits
 */
export function calculateRecommendedMargins(
  environment: EnvironmentType,
  complexity: OperationalComplexity,
  infestation: InfestationLevel
): MarginMatrix {
  // Baseline benchmarks
  let floor = 35.0;  // 35% absolute bottom-line margin target
  let target = 55.0; // 55% average target
  let peak = 75.0;   // 75% highly profitable value margin
  let extraRiskBuffer = 0.0;

  // Environment premium upgrades
  if ((environment as string) === 'Hospital') {
    // Hospital projects demand intensive licensing liability, sterile procedures and bio security
    floor += 10;
    target += 10;
    peak += 5;
    extraRiskBuffer += 8;
  } else if (environment === 'Indústria') {
    // Industrial environments are massive scale enterprise agreements
    floor += 5;
    target += 8;
    extraRiskBuffer += 5;
  } else if (environment === 'Restaurante') {
    // Restaurants represent dense sanitization schedules with high inspection audit rates
    floor += 5;
    target += 5;
  } else if (environment === 'Residência') {
    // Domestic services are highly competitive consumer items, lower target margin
    floor -= 5;
    target -= 5;
  }

  // Infestation stress variables
  if (infestation === 'Crítico') {
    floor += 5;
    target += 6;
    extraRiskBuffer += 4;
  } else if (infestation === 'Alto') {
    target += 3;
  }

  // Complex operations variables
  if (complexity === 'Complexo') {
    floor += 5;
    target += 5;
    extraRiskBuffer += 5;
  }

  // Prevent edge-case margin structures (Cap at reasonable parameters)
  const minimumMarginPercent = Math.min(Math.max(floor, 25.0), 55.0);
  const targetMarginPercent = Math.min(Math.max(target, 45.0), 75.0);
  const optimisticMarginPercent = Math.min(Math.max(peak, 65.0), 85.0);

  return {
    minimumMarginPercent,
    targetMarginPercent,
    optimisticMarginPercent,
    riskPremiumPercent: extraRiskBuffer
  };
}

/**
 * Calculates a deal's real-time risk coefficient base for warning alerts
 */
export function evaluateDealProfitabilityRisk(
  estimatedCost: number,
  suggestedSellingPrice: number,
  actualMarginObtained: number,
  marginMatrix: MarginMatrix
): 'CRÍTICO' | 'ALERTA_BAIXO' | 'OTIMIZADO' | 'EXCELENTE' {
  if (actualMarginObtained < marginMatrix.minimumMarginPercent) {
    return 'CRÍTICO';
  }
  
  if (actualMarginObtained < marginMatrix.targetMarginPercent) {
    return 'ALERTA_BAIXO';
  }

  if (actualMarginObtained > marginMatrix.optimisticMarginPercent) {
    return 'EXCELENTE';
  }

  return 'OTIMIZADO';
}
export interface PricingMarginMetrics {
  grossProfitAmount: number;
  grossMarginPercent: number;
  netMarginPercent: number;
  taxProportions: number;
}
