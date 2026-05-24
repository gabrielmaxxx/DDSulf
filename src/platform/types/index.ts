/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum ModuleStatus {
  ACTIVE = 'active',
  DEPRECATED = 'deprecated',
  STABLE = 'stable',
  EXPERIMENTAL = 'experimental',
}

export enum DebtSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface ModuleOwnership {
  id: string;
  name: string;
  ownerTeam: string;
  techLead: string;
  status: ModuleStatus;
  linesOfCodeEstimated: number;
  testCoverage: number; // 0-100
  lastSecurityAudit: number; // timestamp
}

export interface TechnicalDebtItem {
  id: string;
  title: string;
  component: string;
  severity: DebtSeverity;
  estimatedFixHours: number;
  description: string;
  status: 'pending' | 'in_progress' | 'resolved';
}

export interface SecurityPolicyRule {
  id: string;
  code: string;
  description: string;
  category: 'authentication' | 'data_isolation' | 'api_limits' | 'pwa_cache';
  isEnforced: boolean;
  complianceRatio: number; // percentage compliant
}

export interface PlatformLifecyclePhase {
  name: string;
  status: 'planning' | 'active' | 'sunset';
  completionPercentage: number;
  deprecationWorkflowDate?: number;
}

export interface SystemContract {
  id: string;
  sourceModule: string;
  targetModule: string;
  interfaceName: string;
  isStable: boolean;
  validationRulesCount: number;
}
