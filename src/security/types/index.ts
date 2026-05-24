/**
 * DDSulf SaaS Security Enterprise Types Foundation
 * Combines pre-existing security structure declarations and operational auditing properties.
 */

import { Permission, UserRoleType } from '@/organization/types';

export type UserRole = 
  | 'super_admin' 
  | 'admin' 
  | 'financeiro' 
  | 'gestor_operacional' 
  | 'comercial' 
  | 'tecnico' 
  | 'visualizador';

export type PermissionAction = 
  | 'view' 
  | 'create' 
  | 'edit' 
  | 'delete' 
  | 'export' 
  | 'approve' 
  | 'recalculate' 
  | 'manage_users' 
  | 'access_financials' 
  | 'access_analytics';

export type SecurityModule = 
  | 'dashboard' 
  | 'calculator' 
  | 'financial' 
  | 'inventory' 
  | 'pops' 
  | 'ai' 
  | 'clients' 
  | 'quotes' 
  | 'services';

export type AuditEventCategory = 
  | 'auth' 
  | 'financial' 
  | 'inventory' 
  | 'schedule' 
  | 'ai' 
  | 'tenant' 
  | 'compliance';

export interface AuditLogEntry {
  id: string;
  category?: AuditEventCategory; // Compatible with old model
  action: string;
  actorId?: string; // Compatible with old model
  actorEmail?: string; // Compatible with old model
  actorRole?: UserRole; // Compatible with old model
  targetId?: string; // Compatible with old model
  collectionName?: string; // Compatible with old model
  beforeState?: Record<string, any>;
  afterState?: Record<string, any>;
  timestamp: string | number; // Compatible with both ISO string and number timestamps
  clientTime?: string;
  userAgent?: string;
  isOfflineBuffer?: boolean;
  
  // Custom properties from new model
  tenantId?: string;
  userId?: string;
  userName?: string;
  userRole?: UserRoleType;
  resourceId?: string;
  resourceType?: AuditEventCategory;
  status?: 'success' | 'failure' | 'suspicious';
  ipAddress?: string;
  payload?: Record<string, any>;
  anomalyScore?: number;
}

export interface RoleDef {
  key: UserRole;
  label: string;
  hierarchy: number;
  allowedModules: SecurityModule[];
  allowedActions: PermissionAction[];
  restrictedFields?: string[];
}

export interface SecurityPolicy {
  id: string;
  module: SecurityModule;
  action: PermissionAction;
  allowedRoles: UserRole[];
  requiresMfa?: boolean;
  requiresOnline?: boolean;
}

export interface SessionMetadata {
  sessionId: string;
  userId: string;
  deviceId: string;
  browser: string;
  os: string;
  loggedInAt: number;
  lastActiveAt: number;
  expiresAt: number;
  isValid: boolean;
}

export interface SecurityStatusSummary {
  anomaliesDetectedCount: number;
  unauthorizedAttemptsCount: number;
  mfaComplianceRate: number;
  staleSessionsCount: number;
  lastAuditSyncTime: string;
}

export interface ComplianceConsent {
  userId: string;
  tenantId: string;
  consentType: 'lgpd_terms' | 'telemetry_tracking' | 'ai_processing';
  accepted: boolean;
  acceptedAt: string;
  ipAddress: string;
}

export interface ThreatIncident {
  id: string;
  tenantId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  title: string;
  description: string;
  timestamp: string;
  escalatedTo?: string;
  resolutionNotes?: string;
}
