/**
 * DDSulf Realtime & Sinks Master Type Definitions
 * Designed for modular operational, financial, and analytics events.
 */

import { DocumentData, Query } from 'firebase/firestore';

export type UserRole = 'admin' | 'technician' | 'commercial' | 'auditor';

export interface RealtimeUser {
  uid: string;
  displayName: string;
  email: string;
  role: UserRole;
  activeView: string;
  lastActive: string;
  isOnline: boolean;
}

// 1. Subscription Governance Types
export interface ActiveSubscription {
  id: string;
  path: string;
  type: 'document' | 'collection' | 'query';
  createdAt: string;
  listenerCount: number;
  lastPulseTime?: string;
  networkPriority: 'high' | 'normal' | 'low';
}

export type RealtimeUpdateCallback<T = any> = (data: T, origin: 'remote' | 'optimistic') => void;

export interface SubscriptionOptions {
  priority?: 'high' | 'normal' | 'low';
  enableOfflineCache?: boolean;
  debounceMs?: number;
  queryConstraints?: any[];
}

// 2. Event-Driven Messaging Contract (Event Bus)
export type RealtimeEventType =
  | 'operational:pest_activity'
  | 'operational:chemical_used'
  | 'workflow:draft_updated'
  | 'workflow:completed'
  | 'financial:margin_leakage'
  | 'financial:cost_updated'
  | 'analytics:kpi_pulsed'
  | 'sync:network_changed'
  | 'sync:backlog_reconciled'
  | 'sync:error_encountered';

export interface RealtimeEvent<P = any> {
  id: string;
  type: RealtimeEventType;
  payload: P;
  timestamp: string;
  senderId: string;
  correlationId?: string;
}

// 3. Operational & Financial Data Structures
export interface ChemUsage {
  chemicalId: string;
  chemicalName: string;
  volumeML: number;
  dosageRatio: number;
  costImpact: number;
}

export interface LiveCalculationBreakdown {
  rawChemicalsCost: number;
  laborCost: number;
  displacementCost: number;
  complexityRiskBuffer: number;
  appliedMarginPercent: number;
  suggestedSalesPrice: number;
  taxAmount: number;
  finalPriceWithTax: number;
  netMarginPercent: number;
  leakageAlertActive: boolean;
}

export interface RealtimeAlert {
  id: string;
  type: 'margin_leakage' | 'illegal_dosage' | 'distance_anomaly' | 'offline_desync';
  criticality: 'info' | 'medium' | 'high' | 'critical';
  message: string;
  refId?: string;
  timestamp: string;
  dismissed: boolean;
}

// 4. Offline Backlog and Sychronizer Types
export type SyncAction = 'CREATE' | 'UPDATE' | 'DELETE';

export interface OfflineMutationTask {
  id: string;
  collectionName: string;
  documentId: string;
  action: SyncAction;
  payload: DocumentData;
  timestamp: string;
  retryCount: number;
  priority: number; // For prioritizing crucial financial syncs first
  lastError?: string;
}

export interface NetworkHealthState {
  isOnline: boolean;
  latencyMs: number;
  dataSaverMode: boolean;
  lastConnectedTime: string | null;
}

// 5. Conflict Resolution Profiles
export type ReconciliationPolicyType = 'LWW' | 'SERVER_WINS' | 'CLIENT_WINS' | 'MANUAL';

export interface SyncReconciliationResult<T = any> {
  resolvedDocument: T;
  hasConflict: boolean;
  conflictLog?: string;
  appliedAppliedPolicy: ReconciliationPolicyType;
}
