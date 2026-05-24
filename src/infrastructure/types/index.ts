/**
 * DDSulf Enterprise Performance, Infrastructure & Synchronizations Systems Types
 */

export type ConnectionState = 'online' | 'offline' | 'degraded';

export type SyncOperationType = 'create' | 'update' | 'delete';

export interface SyncPayload {
  collection: string;
  docId: string;
  operation: SyncOperationType;
  timestamp: number;
  data: Record<string, any>;
  retriesCount: number;
}

export interface MetricSnapshot {
  timestamp: number;
  fps: number;
  heapUtilizationPercent: number;
  apiLatencyMs: number;
  domNodesCount: number;
}

export interface FirestoreQueryStats {
  queryHash: string;
  readsCount: number;
  writesCount: number;
  fromCache: boolean;
  durationMs: number;
}

export interface CrashReport {
  id: string;
  timestamp: number;
  module: string;
  errorMessage: string;
  stackTrace?: string;
  recovered: boolean;
}
