/**
 * DDSulf Advanced Audit Trailing & Governance Ledger
 * Safeguards integrity logs of high-impact ERP transactions.
 */

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { AuditLogEntry, AuditEventCategory, UserRole } from '../types';

export class AuditService {
  private static collectionName = 'audit_logs';

  /**
   * Safe transaction log writer. Automatically handles connection losses and logs offline signs
   */
  public static async recordEvent(params: {
    category: AuditEventCategory;
    action: string;
    actorId: string;
    actorEmail: string;
    actorRole: UserRole;
    targetId?: string;
    collectionName?: string;
    beforeState?: Record<string, any>;
    afterState?: Record<string, any>;
  }): Promise<void> {
    const entry: AuditLogEntry = {
      id: 'aud_' + Date.now() + '_' + Math.floor(Math.random() * 100000),
      category: params.category,
      action: params.action,
      actorId: params.actorId,
      actorEmail: params.actorEmail,
      actorRole: params.actorRole,
      targetId: params.targetId,
      collectionName: params.collectionName,
      beforeState: params.beforeState,
      afterState: params.afterState,
      timestamp: Date.now(),
      clientTime: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'ServerNode',
      isOfflineBuffer: typeof navigator !== 'undefined' ? !navigator.onLine : false
    };

    try {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        // Safe direct dispatch to Cloud firestore instance
        const colRef = collection(db, this.collectionName);
        await addDoc(colRef, {
          ...entry,
          createdAt: serverTimestamp()
        });
      } else {
        // Enforce offline audit log buffering inside localStorage or log it clearly
        const existing = localStorage.getItem('ddsulf_offline_audits') || '[]';
        const updated = JSON.parse(existing);
        updated.push(entry);
        localStorage.setItem('ddsulf_offline_audits', JSON.stringify(updated));
        console.warn(`[Audit Service] Network offline. Buffered audit trace locally: ${entry.action}`);
      }
    } catch (err) {
      console.error('[Audit Service] Critical audit trace write suppressed:', err);
    }
  }

  /**
   * Flushes any offline buffered audits back to Cloud ledger storage upon reconnecting
   */
  public static async flushOfflineAudits(): Promise<void> {
    if (typeof localStorage === 'undefined' || !navigator.onLine) return;

    try {
      const existing = localStorage.getItem('ddsulf_offline_audits');
      if (!existing) return;

      const items: AuditLogEntry[] = JSON.parse(existing);
      if (items.length === 0) return;

      const colRef = collection(db, this.collectionName);
      console.log(`[Audit Service] Synchronizing ${items.length} offline audit traces back to cloud ledger.`);

      for (const item of items) {
        await addDoc(colRef, {
          ...item,
          reconciledOnlineAt: serverTimestamp(),
          createdAt: serverTimestamp() // Safe server alignment
        });
      }

      localStorage.removeItem('ddsulf_offline_audits');
    } catch (err) {
      console.warn('[Audit Service] Reconnect flush of logs aborted:', err);
    }
  }
}
export default AuditService;
