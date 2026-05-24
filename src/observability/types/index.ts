/**
 * DDSulf Observability & Operational Telemetry Types
 */

export enum TelemetrySeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export enum OperationalDomain {
  DATABASE = 'database',
  CRM_WORKFLOW = 'crm_workflow',
  OFFLINE_RECONCILIATION = 'offline_reconciliation',
  REALTIME_SOCKET = 'realtime_socket',
  AI_RECOMMENDATION = 'ai_recommendation',
  SECURITY_DOOR = 'security_door'
}

export interface OperationalTelemetryEvent {
  id: string;
  timestamp: string;
  domain: OperationalDomain;
  severity: TelemetrySeverity;
  tenantId: string;
  userId: string;
  title: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface ActivityTrace {
  traceId: string;
  spanId: string;
  parentId?: string;
  name: string;
  startedAt: string;
  durationMs?: number;
  domain: OperationalDomain;
  status: 'success' | 'failed' | 'running';
  parameters?: Record<string, any>;
}

export interface SystemIncident {
  id: string;
  detectedAt: string;
  resolvedAt?: string;
  domain: OperationalDomain;
  severity: TelemetrySeverity;
  title: string;
  description: string;
  impactScore: number; // 0..100
  status: 'unresolved' | 'investigating' | 'resolved';
}

export interface SystemHealthScore {
  databaseHealthStatus: 'optimal' | 'degraded' | 'critical';
  realtimeConnectionState: 'connected' | 'unstable' | 'disconnected';
  aiExplainabilityScore: number;
  overallScore: number; // 0..100
  activeIncidentCount: number;
}
