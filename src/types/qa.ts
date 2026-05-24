/**
 * DDSulf Quality Engineering & Reliability TypeScript Foundation
 */

export enum TestStatus {
  PASSED = 'passed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
  RUNNING = 'running',
  IDLE = 'idle'
}

export enum TestType {
  UNIT = 'unit',
  INTEGRATION = 'integration',
  E2E = 'e2e',
  WORKFLOW = 'workflow',
  REALTIME = 'realtime',
  OFFLINE = 'offline',
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  ACCESSIBILITY = 'accessibility',
  AI = 'ai'
}

export interface TestCase {
  id: string;
  name: string;
  type: TestType;
  description: string;
  status: TestStatus;
  durationMs?: number;
  errorMessage?: string;
  stackTrace?: string;
  lastRun?: string;
}

export interface TestSuite {
  id: string;
  name: string;
  type: TestType;
  status: TestStatus;
  cases: TestCase[];
}

export interface ReliabilityMetric {
  metricName: string;
  value: number | string;
  target: number | string;
  status: 'optimal' | 'warning' | 'critical';
  unit: string;
}

export interface OfflineSyncSimulation {
  id: string;
  payloadType: 'inventory' | 'billing' | 'report' | 'schedule';
  offlineAt: string;
  reconciledAt?: string;
  status: 'queued' | 'syncing' | 'resolved' | 'conflict_manual';
  data: Record<string, any>;
}

export interface RealtimeListenerDiagnostic {
  listenerId: string;
  collectionPath: string;
  eventsReceivedCount: number;
  lastReceivedAt: string;
  status: 'listening' | 'disconnected' | 'healthy_stream';
}

export interface SecurityScanReport {
  scannedAt: string;
  vulnerabilitiesFound: number;
  criticalShieldedRules: boolean;
  tenantBoundaryValidation: boolean;
  roleIsolationPercentage: number;
  details: {
    category: string;
    description: string;
    remediation: string;
    passed: boolean;
  }[];
}

export interface AITestReport {
  evaluatedPromptKey: string;
  temperature: number;
  hallucinationRate: number; // e.g. 0.02
  explainabilityScore: number; // 0..100
  accuracyPercentage: number; // 0..100
  biasValidationPassed: boolean;
  safetyFilterPassed: boolean;
}
