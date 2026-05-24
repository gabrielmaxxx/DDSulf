/**
 * SPDX-License-Identifier: Apache-2.0
 */

export enum RecommendationSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum RecommendationCategory {
  FINANCIAL = 'financial',
  OPERATIONS = 'operations',
  WORKFORCE = 'workforce',
  EXPANSION = 'expansion',
}

export enum RecommendationStatus {
  PENDING_SUPERVISION = 'pending_supervision',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  IMPLEMENTED = 'implemented',
}

export enum DecisionGoal {
  COST_REDUCTION = 'cost_reduction',
  REVENUE_EXPANSION = 'revenue_expansion',
  SAFETY_COMPLIANCE = 'safety_compliance',
  ORGANIZATIONAL_SCALE = 'organizational_scale',
}

export interface ExecutiveMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: number;
}

export interface ExecutiveRecommendation {
  id: string;
  title: string;
  severity: RecommendationSeverity;
  category: RecommendationCategory;
  description: string;
  estimatedImpactBrl: number;
  confidenceScorePercent: number;
  evidenceWorkflow: string;
  remedyActionStep: string;
  status: RecommendationStatus;
  approvedBy?: string;
  approvedAt?: number;
}

export interface ForecastingMetric {
  periodLabel: string; // e.g. "Jun 2026"
  projectedRevenue: number;
  worstScenarioRevenue: number;
  bestScenarioRevenue: number;
  projectedPopsCount: number;
  overheadEstimate: number;
}

export interface StrategicDecisionReasoning {
  id: string;
  goal: DecisionGoal;
  targetObjective: string;
  computedRiskPercent: number;
  factorsRanked: Array<{
    factorName: string;
    impactWeight: number; // 0 to 1
    observedState: string;
  }>;
  suggestedPath: string;
  reasoningRationale: string;
}

export interface BoardLevelSnapshot {
  mrrTotal: number;
  activeContractsRatio: number; // percentage
  operationalEfficiencyCoefficient: number; // ratio
  contingentAssetsReservedBrl: number;
  monthlySafetyIndexPercent: number;
}
