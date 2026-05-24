/**
 * DDSulf Performance Engineering & Enterprise Scalability TypeScript Foundation
 * Encompasses rendering types, caching models, real-time subscription metrics, low-end diagnostics, and telemetry records.
 */

export interface QueryBudget {
  queryName: string;
  executionTimeMs: number;
  maxBudgetMs: number;
}

export interface RenderBudget {
  componentName: string;
  renderTimeMs: number;
  maxBudgetMs: number;
}

export interface PerformanceDiagnostics {
  fpsRate: number;
  memoryUsageMb: number;
  memoryBudgetMb: number;
  activeFirestoreListenersCount: number;
  maxFirestoreListenersAllowed: number;
  networkRequestsBatchSize: number;
  gzipEnabled: boolean;
  lowEndModeActive: boolean;
}

export interface CachedQuery {
  key: string;
  data: any;
  cachedAt: number;
  expiresAt: number;
  hitsCount: number;
}

export interface OptimisticMutation {
  id: string;
  collection: string;
  mutationType: 'add' | 'update' | 'delete';
  payload: any;
  status: 'pending_optimistic' | 'synced_with_server' | 'failed_rolled_back';
}

// ==========================================
// RENDERING TYPES
// ==========================================
export interface RenderMeasurement {
  componentId: string;
  componentName: string;
  renderCount: number;
  lastDurMs: number;
  avgDurMs: number;
  peakDurMs: number;
  mountTimeMs: number;
  unmountTimeMs?: number;
  timestamp: string;
}

export interface RenderingGovernancePolicy {
  maxRenderTimeMs: number;
  maxRendersPerMinute: number;
  logToConsoleOnBreach: boolean;
  highlightPerformanceIssues: boolean;
}

// ==========================================
// CACHING TYPES
// ==========================================
export type CachePersistenceMode = 'memory' | 'local_storage' | 'indexed_db';

export interface CacheEntryMeta {
  key: string;
  scope: 'global' | 'isolation_tenant' | 'user';
  tenantId?: string;
  persistentMode: CachePersistenceMode;
  sizeBytes: number;
  lastAccessed: number;
}

export interface SwrCacheOptions {
  ttlMs: number;
  staleAfterMs: number;
  persistenceMode?: CachePersistenceMode;
}

// ==========================================
// REAL-TIME TYPES
// ==========================================
export interface SubscriptionAllocation {
  channelId: string;
  streamName: string;
  tenantId: string;
  isShared: boolean;
  connectedAt: number;
  signalsReceived: number;
  lastSignalAt: number;
  backpressureBufferLimit: number;
}

export interface RealtimeBackpressureMetric {
  channelId: string;
  bufferedCount: number;
  droppedCount: number;
  flushFrequencyMs: number;
}

// ==========================================
// OPTIMIZATION & RUNTIME TYPES
// ==========================================
export interface IdleTask {
  id: string;
  priority: 'low' | 'medium' | 'high';
  execute: () => void;
  metadata?: Record<string, any>;
}

export interface VirtualViewportDimensions {
  containerHeight: number;
  itemHeight: number;
  overscanCount: number;
  scrollOffset: number;
}

// ==========================================
// PERFORMANCE TELEMETRY TYPES
// ==========================================
export interface TelemetryEvent {
  id: string;
  type: 'render_cycle' | 'cache_lookup' | 'realtime_jitter' | 'memory_spike' | 'interaction_inp';
  metricName: string;
  value: number;
  severity: 'nominal' | 'amber_warning' | 'red_critical';
  timestamp: string;
  tenantId?: string;
}

export interface InpMetric {
  interactionName: string;
  latencyMs: number;
  timestamp: string;
}

// ==========================================
// RESILIENCE & HARDENING TYPES
// ==========================================
export interface CircuitBreakerStatus {
  serviceKey: string;
  state: 'closed' | 'open' | 'half_open';
  failureCount: number;
  lastFailureTime?: number;
  cooldownPeriodMs: number;
}

export interface HardeningOperationalState {
  adaptiveBatterySavingActive: boolean;
  blockUnauthenticatedRealtimeListeners: boolean;
  forcedMemoryGarbagePurgeIntervalSeconds: number;
  fallbackActive: boolean;
}
