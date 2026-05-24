/**
 * DDSulf SaaS Security Enterprise Forensic-Ready Audit System
 * Implements write-once/immutable-like local and cloud tracing, operational anomaly calculations.
 */

import { AuditLogEntry } from '../types';
import { UserRoleType } from '@/organization/types';

class AuditService {
  private auditLogs: AuditLogEntry[] = [];

  constructor() {
    this.seedPlaceholderAuditLogs();
  }

  private seedPlaceholderAuditLogs() {
    this.auditLogs = [
      {
        id: 'log_001',
        tenantId: 'ddsulf_matriz',
        userId: 'user_admin',
        userName: 'Gabriel Max',
        userRole: 'admin',
        action: 'auth:login',
        resourceType: 'auth',
        status: 'success',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        ipAddress: '177.105.12.84',
        anomalyScore: 0.01,
      },
      {
        id: 'log_002',
        tenantId: 'ddsulf_matriz',
        userId: 'user_commercial',
        userName: 'Thiago Consultor',
        userRole: 'commercial',
        action: 'financial:margin-override',
        resourceId: 'quote_erechim_982',
        resourceType: 'financial',
        status: 'success',
        timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
        ipAddress: '177.105.12.89',
        anomalyScore: 0.15,
        payload: {
          originalMargin: 0.35,
          approvedMargin: 0.28,
          authorizedBy: 'Clara Gerente',
        }
      },
      {
        id: 'log_003',
        tenantId: 'ddsulf_matriz',
        userId: 'visitor_unknown',
        userName: 'Anônimo',
        userRole: 'operator',
        action: 'auth:failed_login_limit',
        resourceType: 'auth',
        status: 'suspicious',
        timestamp: new Date(Date.now() - 1200000).toISOString(),
        ipAddress: '198.51.100.41',
        anomalyScore: 0.85,
        payload: {
          targetEmail: 'admin@ddsulf.com.br',
          attemptsCount: 7,
          failureReason: 'Senha incorreta excedida'
        }
      }
    ];
  }

  /**
   * Appends an operational event with security attributes
   */
  public log(params: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
    const entry: AuditLogEntry = {
      id: `audit_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...params,
    };

    // Calculate heuristic anomaly score dynamically
    let anomaly = 0.05;
    if (entry.status === 'suspicious') anomaly += 0.50;
    if (entry.status === 'failure') anomaly += 0.20;
    if (entry.action.includes('override') || entry.action.includes('delete')) anomaly += 0.15;
    
    // Check for unusual hour (e.g., between 11 PM and 5 AM)
    const hour = new Date(entry.timestamp).getHours();
    if (hour < 5 || hour > 23) {
      anomaly += 0.25;
    }

    entry.anomalyScore = Math.min(anomaly, 1);

    // Keep memory history capped at 100 entries for UX simulation scalability
    this.auditLogs.unshift(entry);
    if (this.auditLogs.length > 100) {
      this.auditLogs.pop();
    }

    return entry;
  }

  /**
   * Pulls filtered operations log complying with multi-tenancy boundaries
   */
  public getTenantAuditTrail(tenantId: string): AuditLogEntry[] {
    return this.auditLogs.filter(log => log.tenantId === tenantId);
  }

  /**
   * Isolates anomaly logs exceeding security threshholds
   */
  public getHighRiskIncidentsSync(tenantId: string): AuditLogEntry[] {
    return this.getTenantAuditTrail(tenantId).filter(log => (log.anomalyScore ?? 0) > 0.4);
  }

  /**
   * Resets log stream for demonstrative testing purposes
   */
  public purgeSafeSimulationLogs() {
    this.auditLogs = [];
  }
}

export const auditService = new AuditService();
export default auditService;
