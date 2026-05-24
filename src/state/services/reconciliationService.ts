/**
 * State Conflict Reconciliation and Identity Alignment Service
 * Specializes in Last-Write-Wins (LWW) resolution and array identity integrity.
 */

export interface SyncRecord {
  id: string;
  updatedAt: string;
  [key: string]: any;
}

export class ReconciliationService {
  /**
   * Reconciles two objects using Last-Write-Wins strategy.
   * If updatedAt is identical, client state wins to avoid server lag visual feedback loop.
   */
  public resolveLWW<T extends SyncRecord>(client: T, server: T): T {
    const clientTime = new Date(client.updatedAt).getTime();
    const serverTime = new Date(server.updatedAt).getTime();

    if (clientTime >= serverTime) {
      console.log(`[ReconciliationService] Client state is newer or same as Server for ID: ${client.id}. Client wins.`);
      return client;
    }

    console.warn(`[ReconciliationService] Server state is newer for ID: ${client.id}. Server wins. Overwriting local view.`);
    return server;
  }

  /**
   * Safe list merger. Consolidates collections by removing duplicate entities,
   * aligning updated dates, and maintaining a chronological, correct history.
   */
  public mergeCollections<T extends SyncRecord>(localList: T[], remoteList: T[]): T[] {
    const registry = new Map<string, T>();

    // Register all local entries
    localList.forEach(item => {
      registry.set(item.id, item);
    });

    // Merge in remote entries with Last-Write-Wins logic
    remoteList.forEach(remoteItem => {
      const localItem = registry.get(remoteItem.id);
      if (!localItem) {
        registry.set(remoteItem.id, remoteItem);
      } else {
        const resolved = this.resolveLWW(localItem, remoteItem);
        registry.set(remoteItem.id, resolved);
      }
    });

    return Array.from(registry.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  /**
   * Simple delta-change detector to check if user needs warning alert of modified resource.
   */
  public hasStructuralConflict<T extends SyncRecord>(local: T, remote: T, comparedKeys: string[] = []): boolean {
    if (local.id !== remote.id) return false;
    
    // Check if remote timestamp is actually newer
    const isRemoteNewer = new Date(remote.updatedAt).getTime() > new Date(local.updatedAt).getTime();
    if (!isRemoteNewer) return false;

    // Check specified keys for divergent fields
    const keys = comparedKeys.length > 0 ? comparedKeys : Object.keys(local);
    for (const key of keys) {
      if (key === 'updatedAt' || key === 'version') continue;
      if (JSON.stringify(local[key]) !== JSON.stringify(remote[key])) {
        return true; // We found a structural divergence
      }
    }

    return false;
  }
}

export const reconciliationService = new ReconciliationService();
