/**
 * DDSulf Live State Hydration & Reconciliation Coordinator
 * Integrates incoming cloud database snapshots with buffered local queue edits.
 */

import { CacheService } from '../cache';
import { OfflineQueueService } from '../queue';
import { ReconciliationEngine } from '../reconciliation';

export class HydrationService {
  /**
   * Integrates an incoming network snapshot array with outstanding local-first mutations.
   * Ensures that un-synced edits are not overwritten by stale server states.
   */
  public static async hydrate<T extends { id?: string; updatedAt?: any }>(
    collectionName: string,
    remoteDocs: T[]
  ): Promise<T[]> {
    const pendingMutations = await OfflineQueueService.getPending();
    const relatedMutations = pendingMutations.filter(m => m.collection === collectionName);

    if (relatedMutations.length === 0) {
      // Direct stream write into local cache for lightning-fast subsequent launches
      await CacheService.cacheCollection(collectionName, remoteDocs);
      return remoteDocs;
    }

    // Clone and map
    const mergedMap = new Map<string, T>(remoteDocs.map(doc => [doc.id!, doc]));

    for (const mutation of relatedMutations) {
      const targetId = mutation.targetId;
      const existingDoc = mergedMap.get(targetId);

      if (mutation.type === 'create') {
        const payloadDoc = { id: targetId, ...mutation.payload } as T;
        mergedMap.set(targetId, payloadDoc);
      } 
      else if (mutation.type === 'update') {
        if (existingDoc) {
          const { resolvedDoc } = ReconciliationEngine.reconcile(
            collectionName,
            targetId,
            mutation.payload as any,
            existingDoc as any,
            'last-write-wins'
          );
          mergedMap.set(targetId, resolvedDoc as T);
        } else {
          // If not present in server list, treat update content as partial placeholder
          const payloadDoc = { id: targetId, ...mutation.payload } as T;
          mergedMap.set(targetId, payloadDoc);
        }
      } 
      else if (mutation.type === 'delete') {
        mergedMap.delete(targetId);
      }
    }

    const consolidatedList = Array.from(mergedMap.values());
    
    // Save to Cache storage
    await CacheService.cacheCollection(collectionName, consolidatedList);

    return consolidatedList;
  }
}
