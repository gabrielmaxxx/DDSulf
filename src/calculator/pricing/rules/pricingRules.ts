import { RuleEngineSettings } from '../types';
import { PestType, EnvironmentType, InfestationLevel, OperationalComplexity, Recurrence, UrgencyLevel } from '@/types/database';

export const DEFAULT_RULE_SETTINGS: RuleEngineSettings = {
  multipliers: {
    pests: {
      'Baratas': 1.0,
      'Ratos': 1.3,
      'Cupins': 1.8,
      'Formigas': 1.0,
      'Escorpiões': 1.5,
      'Pulgas': 1.4,
      'Mosquitos': 1.2,
      'Percevejos': 1.6,
      'Outros': 1.0
    },
    environments: {
      'Residência': 1.0,
      'Comércio': 1.15,
      'Indústria': 1.4,
      'Restaurante': 1.3,
      'Condomínio': 1.25,
      'Hospital': 1.5,
      'Área Externa': 1.1
    },
    infestations: {
      'Baixo': 0.9,
      'Médio': 1.0,
      'Alto': 1.25,
      'Crítico': 1.6
    },
    complexities: {
      'Simples': 0.9,
      'Normal': 1.0,
      'Complexo': 1.35
    },
    urgencies: {
      'Normal': 1.0,
      'Prioritário': 1.15,
      'Emergência': 1.35
    },
    recurrences: {
      'Único': 1.0,      // Spot price
      'Mensal': 0.82,     // 18% Monthly Recurring Discount
      'Trimestral': 0.90, // 10% Quarterly Recurring Discount
      'Semestral': 0.94,  // 6% Semiannual Recurring Discount
      'Anual': 0.75       // 25% Annual Contract Discount
    }
  },
  baseRates: {
    hourlyLaborCost: 45.0,        // R$45.00/hour spent per technician
    costPerKm: 1.85,              // Vehicle fuel & maintenance amortized per Km
    equipmentBaseAmortization: 35.0, // Baseline tool wear amortization
    wasteSafetyRatio: 1.10,       // 10% chemical waste safety cushion
    fixedOperationalIndirectFee: 60.0 // Administration, PPE, call-routing overhead per service
  }
};

/**
 * Calculates a relative weight multiplier based on the active project descriptors
 */
export function getCompositeMultiplier(
  pest: PestType,
  environment: EnvironmentType,
  infestation: InfestationLevel,
  complexity: OperationalComplexity,
  urgency: UrgencyLevel,
  settings: RuleEngineSettings = DEFAULT_RULE_SETTINGS
): number {
  const m = settings.multipliers;
  return (
    m.pests[pest] *
    m.environments[environment] *
    m.infestations[infestation] *
    m.complexities[complexity] *
    m.urgencies[urgency]
  );
}

/**
 * Estimates pure task execution duration in hours based on raw area footprint and complexity parameters
 */
export function estimateDurationHours(
  areaSizeM2: number,
  pest: PestType,
  complexity: OperationalComplexity,
  infestation: InfestationLevel,
  settings: RuleEngineSettings = DEFAULT_RULE_SETTINGS
): number {
  // Base formulation: 1 hour for every 150m2 as a starting standard
  const standardAreaRate = areaSizeM2 / 150;
  const baseTime = 1.0 + standardAreaRate;

  const complexFactor = settings.multipliers.complexities[complexity];
  const infestationFactor = settings.multipliers.infestations[infestation];
  
  // Specific pest complexity impacts
  let pestFactor = 1.0;
  if (pest === 'Cupins') pestFactor = 1.5; // termite services take longer due to drilling
  if (pest === 'Ratos') pestFactor = 1.15; // requires placing multiple secure trap-boxes
  if (pest === 'Escorpiões') pestFactor = 1.25; // comprehensive cracks sealing inspection

  const finalDuration = baseTime * complexFactor * infestationFactor * pestFactor;
  
  // Constrain hours to realistic ranges (0.5h to 16h max)
  return Math.min(Math.max(finalDuration, 0.75), 16.0);
}

/**
 * Calculates Expected Operational Contract Lifespan for LTV metrics based on recurrence type
 */
export function getExpectedLTVDurationMonths(recurrence: Recurrence): number {
  switch (recurrence) {
    case 'Mensal': return 18;      // Typically remains on board for 1.5 years
    case 'Trimestral': return 24;  // Highly sticky commercial contracts (2 years)
    case 'Semestral': return 12;   // 1 year
    default: return 1;             // Spot service has 1-month scope
  }
}
