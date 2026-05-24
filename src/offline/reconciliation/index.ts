/**
 * DDSulf Distributed Reconciliation & Conflict Resolution Engine
 * Handles Last-Write-Wins state replication, item checklist merges, and financial safety rules.
 */

import { ConflictReport } from '../types';

export class ReconciliationEngine {
  /**
   * Evaluates state conflict between client's offline value and server's upstream copy
   */
  public static reconcile<T extends Record<string, any>>(
    collection: string,
    targetId: string,
    clientDoc: T,
    serverDoc: T,
    strategy: 'last-write-wins' | 'server-preference' | 'client-preference' = 'last-write-wins'
  ): { resolvedDoc: T; report: ConflictReport<T> } {
    const report: ConflictReport<T> = {
      targetId,
      collection,
      clientDoc,
      serverDoc,
      strategy: 'last-write-wins',
      reconciledAt: Date.now()
    };

    if (strategy === 'server-preference') {
      report.strategy = 'server-preference';
      return { resolvedDoc: { ...serverDoc }, report };
    }

    if (strategy === 'client-preference') {
      report.strategy = 'client-preference';
      return { resolvedDoc: { ...clientDoc }, report };
    }

    // Default: Last-Write-Wins (LWW) based on timestamps, protecting specific nested objects
    const resolvedDoc = { ...serverDoc } as Record<string, any>;

    const clientTimestamp = clientDoc.updatedAt 
      ? new Date(clientDoc.updatedAt as any).getTime() 
      : 0;
    const serverTimestamp = serverDoc.updatedAt 
      ? new Date(serverDoc.updatedAt as any).getTime() 
      : 0;

    // Financial calculations fields protection rules (do not drift)
    const protectsFinancials = ['suggestedPrice', 'estimatedCost', 'amount', 'estimatedMargin'];

    for (const key of Object.keys({ ...clientDoc, ...serverDoc })) {
      const isFin = protectsFinancials.includes(key);

      if (isFin) {
        // For financial items: we prefer to keep the maximum precision or the latest client calculation if is non-zero
        if (clientDoc[key] !== undefined && clientDoc[key] !== 0) {
          resolvedDoc[key] = clientDoc[key];
        } else {
          resolvedDoc[key] = serverDoc[key] ?? clientDoc[key];
        }
        continue;
      }

      // Handle checklist arrays (merge items cleanly without duplication)
      if (Array.isArray(clientDoc[key]) && Array.isArray(serverDoc[key])) {
        const mergedSet = new Set([...serverDoc[key], ...clientDoc[key]]);
        resolvedDoc[key] = Array.from(mergedSet);
        continue;
      }

      // Standard field properties merge based on timestamp
      if (clientTimestamp >= serverTimestamp) {
        if (clientDoc[key] !== undefined) {
          resolvedDoc[key] = clientDoc[key];
        }
      } else {
        if (serverDoc[key] !== undefined) {
          resolvedDoc[key] = serverDoc[key];
        }
      }
    }

    report.resolvedDoc = resolvedDoc as T;
    return { resolvedDoc: resolvedDoc as T, report };
  }
}
