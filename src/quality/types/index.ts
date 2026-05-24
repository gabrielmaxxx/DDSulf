/**
 * SPDX-License-Identifier: Apache-2.0
 */

export enum TestType {
  UNIT = 'unit',
  INTEGRATION = 'integration',
  E2E = 'e2e',
  CONTRACT = 'contract',
  RESILIENCE = 'resilience',
  SECURITY = 'security',
  AI = 'ai',
  CHAOS = 'chaos',
  PERFORMANCE = 'performance'
}

export enum TestStatus {
  PASSED = 'passed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
  RUNNING = 'running',
  IDLE = 'idle'
}

export interface TestCase {
  id: string;
  name: string;
  description: string;
  type: TestType;
  suite: string;
  status: TestStatus;
  durationMs?: number;
  errorMessage?: string;
  assertionsCount: number;
}

export interface ReliabilityMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  status: 'optimal' | 'warning' | 'critical';
  timestamp: number;
}

export interface ChaosExperiment {
  id: string;
  name: string;
  description: string;
  targetModule: string;
  status: 'idle' | 'active' | 'completed' | 'failed';
  injectedFailureType: 'latency'| 'network_offline' | 'state_corruption' | 'tenant_breach' | 'concurrency_race';
  severity: 'low' | 'medium' | 'high' | 'critical';
  systemRecoveryTimeMs?: number;
}

export interface QualityReport {
  id: string;
  score: number; // 0 - 100
  totalTests: number;
  passedCount: number;
  failedCount: number;
  coveragePercent: number;
  resilienceScore: number;
  productionReady: boolean;
  timestamp: number;
}

export interface SecurityAuditResult {
  id: string;
  policyName: string;
  status: 'secure' | 'warning' | 'breached';
  testedScopes: string[];
  details: string;
  tenantId: string;
}

export interface AIConsistencyMetric {
  id: string;
  promptSignature: string;
  hallucinationRate: number; // percent
  explainabilityScore: number; // percent
  contextAdherence: number; // percent
  recommendationStability: number; // percent
}
