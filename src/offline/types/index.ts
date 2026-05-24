/**
 * DDSulf Offline-First Sync & Distributed State Type Catalog
 * Represents contract interfaces for queue, persistence, reconciliation and metadata.
 */

export type OfflineMutationType = 'create' | 'update' | 'delete';

export interface OfflineMutation<T = any> {
  id: string; // Unique GUID for this sync action unit
  collection: string; // Target Firestore or local collection path
  targetId: string; // Target document identifier
  type: OfflineMutationType;
  payload: Partial<T>;
  timestamp: number; // Client execution timestamp for Last-Write-Wins (LWW)
  retryCount: number;
  lastAttemptAt?: number;
  status: 'pending' | 'syncing' | 'failed';
  error?: string;
  clientId: string; // Audit owner/session trace
}

export type NetworkMode = 'premium' | 'degraded' | 'offline';

export interface ConnectivityState {
  isOnline: boolean;
  latencyMs: number;
  mode: NetworkMode;
  lastCheckedAt: number;
}

export interface SyncSessionLog {
  id: string;
  startedAt: number;
  finishedAt?: number;
  mutationsProcessed: number;
  mutationsSuccessful: number;
  mutationsFailed: number;
  errors: Array<{ mutationId: string; message: string }>;
}

export interface ConflictReport<T = any> {
  targetId: string;
  collection: string;
  clientDoc: T;
  serverDoc: T;
  resolvedDoc?: T;
  strategy: 'last-write-wins' | 'server-preference' | 'client-preference' | 'manual-reconciled';
  reconciledAt: number;
}

export interface OfflineDraft<T = any> {
  id: string; // Workflow/Form Identifier
  stepKey: string; // Active Multi-step Wizard Location
  payload: T;
  updatedAt: number;
  isCompleted: boolean;
}

export interface CacheGovernancePolicy {
  storeName: string;
  maxAgeMs: number; // TTL (Time-To-Live)
  version: number;
  hydrateFromServerOnStale: boolean;
}
