/**
 * SPDX-License-Identifier: Apache-2.0
 */

export enum OnboardingStepStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export enum RolloutPhase {
  ALPHA_PILOT = 'alpha_pilot',
  REGIONAL_BETA = 'regional_beta',
  ENTERPRISE_WIDE = 'enterprise_wide',
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  status: OnboardingStepStatus;
  moduleCovered: string;
  estimatedMinutes: number;
}

export interface RolloutFeatureGate {
  id: string;
  featureName: string;
  requiredPhase: RolloutPhase;
  isEnabled: boolean;
  adoptedUsersCount: number;
  criticality: 'low' | 'medium' | 'high';
}

export interface TrainingModule {
  id: string;
  title: string;
  category: 'safety' | 'finance' | 'pesticides' | 'pwa_offline';
  videoUrl?: string; // Standard or simulated video url
  isCompleted: boolean;
  scorePercent?: number;
}

export interface MigrationBatch {
  id: string;
  sourceSystemName: string;
  recordsCount: number;
  status: 'pending' | 'processing' | 'done' | 'failed';
  integrityHash: string;
}

export interface OrganizationalReadiness {
  resistanceFactorPercent: number; // lower is better
  staffTrainedRatio: number; // index of staff trained
  offlineSyncTestingPassed: boolean;
  overallHealthScore: number; // 0 to 100
}
