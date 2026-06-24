/**
 * DDSulf SaaS Security Enterprise Forensic-Ready Audit System
 * Implements write-once/immutable-like local and cloud tracing, operational anomaly calculations.
 */

import { AuditLogEntry } from '../types';
import { db } from '@/firebase/config';
import { collection, doc, setDoc, getDocs, query, where, limit } from 'firebase/firestore';

class AuditService {
  /**
   * Appends an operational event with security attributes to Firestore audit_logs collection
   */
  public async log(params: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<AuditLogEntry> {
    const logId = `audit_${Math.random().toString(36).substr(2, 9)}`;
    const timestampNum = Date.now();
    const timestampISO = new Date(timestampNum).toISOString();

    // Calculate heuristic anomaly score dynamically
    let anomaly = 0.05;
    if (params.status === 'suspicious') anomaly += 0.50;
    if (params.status === 'failure') anomaly += 0.20;
    if (params.action && (params.action.includes('override') || params.action.includes('delete'))) anomaly += 0.15;
    
    // Check for unusual hour (e.g., between 11 PM and 5 AM)
    const hour = new Date(timestampNum).getHours();
    if (hour < 5 || hour > 23) {
      anomaly += 0.25;
    }

    const anomalyScore = Math.min(anomaly, 1);

    // Format schema required by security rules: (id, eventName, timestamp, date, time, user)
    const dateStr = timestampISO.split('T')[0];
    const timeStr = new Date(timestampNum).toTimeString().split(' ')[0];
    const userStr = params.userName || params.userId || 'Anônimo';

    const entry: AuditLogEntry & { eventName: string; date: string; time: string; user: string } = {
      ...params,
      id: logId,
      timestamp: timestampNum,
      eventName: params.action || 'unknown',
      date: dateStr,
      time: timeStr,
      user: userStr,
      anomalyScore,
    };

    try {
      const docRef = doc(db, 'audit_logs', logId);
      await setDoc(docRef, entry);
      console.log(`[AuditService] Log ${logId} persistido com sucesso no Firestore.`);
    } catch (error) {
      console.error('[AuditService] Erro ao gravar log de auditoria no Firestore:', error);
    }

    return entry;
  }

  /**
   * Pulls filtered operations log complying with multi-tenancy boundaries
   */
  public async getTenantAuditTrail(tenantId: string): Promise<AuditLogEntry[]> {
    try {
      const colRef = collection(db, 'audit_logs');
      const q = query(
        colRef,
        where('tenantId', '==', tenantId),
        limit(100)
      );
      const snap = await getDocs(q);
      const logs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as AuditLogEntry);

      // Sort in memory by timestamp descending
      return logs.sort((a, b) => {
        const timeA = typeof a.timestamp === 'number' ? a.timestamp : new Date(a.timestamp).getTime();
        const timeB = typeof b.timestamp === 'number' ? b.timestamp : new Date(b.timestamp).getTime();
        return timeB - timeA;
      });
    } catch (error) {
      console.error('[AuditService] Erro ao buscar audit trail no Firestore:', error);
      return [];
    }
  }

  /**
   * Isolates anomaly logs exceeding security thresholds
   */
  public async getHighRiskIncidentsSync(tenantId: string): Promise<AuditLogEntry[]> {
    const logs = await this.getTenantAuditTrail(tenantId);
    return logs.filter(log => (log.anomalyScore ?? 0) > 0.4);
  }

  /**
   * Resets log stream for demonstrative testing purposes (stub for compatibility)
   */
  public purgeSafeSimulationLogs() {
    console.log('[AuditService] Purge requested but logs are immutable in Cloud Firestore.');
  }
}

export const auditService = new AuditService();
export default auditService;

