import { EnvironmentType, OperationalComplexity, PestType, Recurrence } from '@/types/database';

export interface MarginIntelligenceConfig {
  id: string;
  minAcceptableMargin: number;    // floor limit (e.g., 35%)
  targetMargin: number;           // benchmark goal (e.g., 55%)
  eliteMargin: number;            // super high yield (e.g., 75%)
  riskPremiumModifiers: {
    complexity: Record<OperationalComplexity, number>; // addition to floor margins
    environment: Record<EnvironmentType, number>;
  };
  recurrenceDiscountModifiers: Record<Recurrence, number>; // e.g., monthly contracts yield stability discount
  isDefault: boolean;
  updatedAt: string;
}

export interface DetailedOperationalMargin {
  grossMarginPercent: number;
  netMarginPercent: number;
  riskAdjustedMarginPercent: number;
  complexityPenaltyPercent: number;
  unproductivityBufferPercent: number;
  displacementDegradationPercent: number;
  actualNetProfitAmount: number;
  breakEvenThresholdPrice: number;
}

export interface OperationalViabilityReport {
  score: number; // 0 - 100 rating
  classification: 'OUTSTANDING' | 'VIABLE' | 'WARNING' | 'UNVIABLE';
  limitingFactor: 'OVERHEAD' | 'LOGISTICS' | 'LABOR_SHORTAGE' | 'INSUFFICIENT_PRICE' | 'NONE';
  remedialActions: string[];
}

export interface RiskAnalysisSnapshot {
  overallRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'MAXIMUM_CRITICAL';
  financialRiskScore: number;  // 0 - 100
  operationalRiskScore: number; // 0 - 100
  logisticsRiskScore: number;   // 0 - 100
  marginDeteriorationProbabilityPercent: number;
}

export interface DecisionRecommendation {
  id: string;
  recommendedPriceDeltaPercent: number;
  idealMarginAdjustmentPercent: number;
  suggestedAction: string;
  rationale: string;
  confidenceScore: number; // AI confidence (0 - 1)
}

export interface ProfitabilitySimulationScenario {
  id: string;
  label: string;
  modifiedVariables: {
    manHoursAdjustment?: number;
    marginTargetAdjustment?: number;
    displacementAdjustment?: number;
    recurrenceDiscountOverride?: number;
  };
  simulationResults: {
    totalDirectCost: number;
    totalIndirectOverhead: number;
    taxCost: number;
    finalSellingPrice: number;
    profitAmount: number;
    marginPercent: number;
    viabilityScore: number;
  };
}

export interface ProfitabilityTrendPoint {
  period: string; // "Jan", "Feb", etc.
  averageMarginPercent: number;
  volumeCount: number;
  revenueAmount: number;
  costsAmount: number;
  trendRiskRating: 'STABLE' | 'UPWARD_PROGRESS' | 'DEGRADATION';
}

export interface MarginIntelligenceAlert {
  id: string;
  code: string;
  level: 'info' | 'success' | 'warning' | 'error';
  title: string;
  description: string;
  financialWeight: string;   // Monetary impact string
  correctiveGuidance: string;
}
