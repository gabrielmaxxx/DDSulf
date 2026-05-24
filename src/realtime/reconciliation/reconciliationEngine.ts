import { ReconciliationPolicyType, SyncReconciliationResult } from '../types';

export interface ReconcilableDocument {
  id: string;
  updatedAt: string;
  version?: number;
  [key: string]: any;
}

export class ReconciliationEngine {
  private static instance: ReconciliationEngine;

  public static getInstance(): ReconciliationEngine {
    if (!ReconciliationEngine.instance) {
      ReconciliationEngine.instance = new ReconciliationEngine();
    }
    return ReconciliationEngine.instance;
  }

  /**
   * Reconciles two documents according to the designated operational safety policy.
   */
  public reconcile<T extends ReconcilableDocument>(
    clientDoc: T,
    serverDoc: T,
    policy: ReconciliationPolicyType = 'LWW'
  ): SyncReconciliationResult<T> {
    if (clientDoc.id !== serverDoc.id) {
      throw new Error(`[ReconciliationEngine] Identity mismatch: ${clientDoc.id} vs ${serverDoc.id}`);
    }

    const clientVer = clientDoc.version || 0;
    const serverVer = serverDoc.version || 0;
    const clientTime = new Date(clientDoc.updatedAt).getTime();
    const serverTime = new Date(serverDoc.updatedAt).getTime();

    // Check if there is an actual value division
    const hasConflict = this.detectValueConflict(clientDoc, serverDoc);

    if (!hasConflict) {
      return {
        resolvedDocument: clientTime >= serverTime ? clientDoc : serverDoc,
        hasConflict: false,
        appliedAppliedPolicy: policy,
      };
    }

    let resolved: T;
    let logMsg = '';

    switch (policy) {
      case 'SERVER_WINS':
        resolved = serverDoc;
        logMsg = `Forced Server-Wins strategy applied. Local changes overwritten.`;
        break;

      case 'CLIENT_WINS':
        resolved = clientDoc;
        logMsg = `Forced Client-Wins strategy applied. Client state persisted.`;
        break;

      case 'LWW':
      default:
        // Prioritize client in perfect timestamp ties to avoid latency blink loop
        if (clientTime >= serverTime) {
          resolved = clientDoc;
          logMsg = `Client timestamp (${clientDoc.updatedAt}) is newer or equal to server (${serverDoc.updatedAt}). Client wins.`;
        } else {
          resolved = serverDoc;
          logMsg = `Server timestamp (${serverDoc.updatedAt}) is newer than client (${clientDoc.updatedAt}). Server wins.`;
        }
        break;
    }

    if (process.env.NODE_ENV !== 'production') {
      console.warn(`⚠️ [Reconciliation] Conflict resolved on ${clientDoc.id}: ${logMsg}`);
    }

    return {
      resolvedDocument: resolved,
      hasConflict: true,
      conflictLog: logMsg,
      appliedAppliedPolicy: policy,
    };
  }

  /**
   * Safe list merge. Unifies local lists and server streams, avoiding duplicated UUIDs
   * and selecting the most up-to-date entry through LWW reconciliation.
   */
  public mergeLists<T extends ReconcilableDocument>(
    localList: T[],
    remoteList: T[],
    policy: ReconciliationPolicyType = 'LWW'
  ): T[] {
    const registry = new Map<string, T>();

    localList.forEach((item) => {
      registry.set(item.id, item);
    });

    remoteList.forEach((remoteItem) => {
      const localItem = registry.get(remoteItem.id);
      if (!localItem) {
        registry.set(remoteItem.id, remoteItem);
      } else {
        const result = this.reconcile(localItem, remoteItem, policy);
        registry.set(remoteItem.id, result.resolvedDocument);
      }
    });

    // Return chronological descending list (newest first)
    return Array.from(registry.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  /**
   * Helper to inspect key values and check if actual logical divergence exists
   */
  private detectValueConflict(client: any, server: any): boolean {
    const ignoredKeys = ['updatedAt', 'version', 'lastPulseTime'];
    const clientKeys = Object.keys(client).filter((k) => !ignoredKeys.includes(k));
    const serverKeys = Object.keys(server).filter((k) => !ignoredKeys.includes(k));

    if (clientKeys.length !== serverKeys.length) return true;

    for (const key of clientKeys) {
      if (JSON.stringify(client[key]) !== JSON.stringify(server[key])) {
        return true;
      }
    }
    return false;
  }
}

export const reconciliationEngine = ReconciliationEngine.getInstance();
