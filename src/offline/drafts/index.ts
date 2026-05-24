/**
 * DDSulf Draft Auto-Save & Temporary State Persistence
 * Ensures multi-step forms, inspection reports, and quotes remain recoverable on crashes.
 */

import { DDSulfIndexedDB, STORES } from '../persistence/indexedDb';
import { OfflineDraft } from '../types';

export class DraftsService {
  /**
   * Persists draft session values and the current step identifier to IndexedDB
   */
  public static async save<T>(id: string, stepKey: string, payload: T): Promise<void> {
    const draft: OfflineDraft<T> = {
      id,
      stepKey,
      payload,
      updatedAt: Date.now(),
      isCompleted: false
    };
    await DDSulfIndexedDB.put(STORES.DRAFTS, draft);
  }

  /**
   * Retrieves an active form draft from IndexedDB
   */
  public static async get<T>(id: string): Promise<OfflineDraft<T> | null> {
    return DDSulfIndexedDB.get<OfflineDraft<T>>(STORES.DRAFTS, id);
  }

  /**
   * Clears out draft once user successfully completes the operational workflow
   */
  public static async clear(id: string): Promise<void> {
    await DDSulfIndexedDB.delete(STORES.DRAFTS, id);
    console.log(`[Drafts Service] Removed completed draft: ${id}`);
  }

  /**
   * Lists all incomplete wizard buffers inside memory
   */
  public static async listAll(): Promise<OfflineDraft[]> {
    const list = await DDSulfIndexedDB.getAll<OfflineDraft>(STORES.DRAFTS);
    return list.filter(d => !d.isCompleted);
  }
}
