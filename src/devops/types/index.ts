/**
 * DDSulf DevOps, Observability, and Delivery Infrastructure Types
 * Fully compliant with the enterprise production-grade release platform specifications.
 */

export type EnvironmentType = 'development' | 'staging' | 'production';

// Pipeline Types
export type PipelineJobType = 'build' | 'validation' | 'security_scan' | 'smoke_test' | 'deploy_gate';
export type PipelineStepStatus = 'queued' | 'running' | 'passed' | 'failed' | 'skipped';

export interface PipelineStep {
  id: string;
  name: string;
  type: PipelineJobType;
  status: PipelineStepStatus;
  startedAt?: string;
  finishedAt?: string;
  durationMs?: number;
  logs: string[];
}

export interface PipelineRun {
  id: string;
  commitSha: string;
  branch: string;
  triggeredBy: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  startedAt: string;
  finishedAt?: string;
  steps: PipelineStep[];
  environment: EnvironmentType;
}

// Deployment Types
export interface DeploymentRecord {
  id: string; // e.g., 'dep_20260523_1'
  version: string; // e.g., 'v2.4.1'
  environment: EnvironmentType;
  status: 'deploying' | 'healthy' | 'unhealthy' | 'rolling_back' | 'rolled_back';
  commitSha: string;
  triggeredBy: string; // e.g., 'github-actions' | 'gabriel@ddsulf'
  deployedAt: string;
  buildDurationMs: number;
  unresolvedErrorsCount: number;
  canaryWeight?: number; // percentage of traffic routed
  tenantIsolationLevel: 'isolated' | 'shared' | 'hybrid';
}

// Release Types
export interface ReleaseLog {
  version: string;
  releaseDate: string;
  notes: string[];
  scope: 'major' | 'minor' | 'patch' | 'hotfix';
  author: string;
  approvedBy: string;
  pwaUpdateInvalided: boolean;
  deploymentId: string;
  rollbackTriggers: string[];
}

// Infrastructure and Operational Runtime Types
export type ResourceType = 'database_replica' | 'cdn_endpoint' | 'pwa_service_worker' | 'gemini_api_proxy' | 'firestore_index' | 'auth_broker';

export interface InfrastructureResource {
  id: string;
  name: string;
  type: ResourceType;
  status: 'active' | 'degraded' | 'failed' | 'provisioning';
  tier: 'tier-1-critical' | 'tier-2-operational' | 'tier-3-monitoring';
  currentLoad: number; // percentage
  region: string;
  updatedAt: string;
}

export interface SecurityAuditRecord {
  id: string;
  timestamp: string;
  module: string;
  action: string;
  actor: string;
  ipAddress: string;
  status: 'allowed' | 'blocked' | 'escalated';
  details: string;
}

// Operational Metric and Incident Types
export interface OperationalMetric {
  timestamp: string;
  pwaCacheHits: number;
  firestoreReads: number;
  apiLatencyMs: number;
  pwaSyncQueueSize: number;
  activeRealtimeListeners: number;
  pwaOfflineStatus: 'online' | 'offline';
  cpuUtilization: number;
  memoryUsageMb: number;
}

export interface AppIncidentReport {
  id: string;
  severity: 'low' | 'warning' | 'error' | 'fatal';
  message: string;
  stackTrace?: string;
  timestamp: string;
  resolved: boolean;
  tenantId?: string;
  rollbackExecuted?: boolean;
}

// Governance standard schema for display
export interface DevOpsPolicy {
  code: string;
  title: string;
  description: string;
  requirements: string[];
  certified: boolean;
}
