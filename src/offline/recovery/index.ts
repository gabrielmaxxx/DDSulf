/**
 * DDSulf Disaster Recovery & Workflow Restoration Service
 * Implements queue triage, stalled background operation resets, and draft rescue flows.
 */

import { DDSulfIndexedDB, STORES } from '../persistence/indexedDb';
import { OfflineMutation } from '../types';

export class RecoveryService {
  /**
   * Resets mutations stuck in a "failed" status to "pending" to trigger a sync retry
   */
  public static async triageAndResetFailedFields(): Promise<number> {
    const allQueueItems = await DDSulfIndexedDB.getAll<OfflineMutation>(STORES.MUTATIONS_QUEUE);
    let resetCount = 0;

    for (const item of allQueueItems) {
      if (item.status === 'failed' && item.retryCount > 0) {
        item.status = 'pending';
        item.retryCount = 0; // Reset fail counter to allow standard execution
        await DDSulfIndexedDB.put(STORES.MUTATIONS_QUEUE, item);
        resetCount++;
      }
    }

    if (resetCount > 0) {
      console.log(`%c[Recovery Service] Repaired and rescheduled ${resetCount} stalled sync actions.`, 'color: #ea580c;');
    }
    return resetCount;
  }

  /**
   * Automatically rescues incomplete drafts from potential App/PWA tab crashes
   */
  public static async rescueActiveForms(): Promise<Array<{ id: string; step: string }>> {
    const list = await DDSulfIndexedDB.getAll<any>(STORES.DRAFTS);
    return list.map(item => ({
      id: item.id,
      step: item.stepKey
    }));
  }
}
