/**
 * DDSulf Realtime Offline Synchronization Coordinator Core
 * Governs active flushing, visibility boundaries, concurrency locks, and transaction retry policies.
 */

import { doc, setDoc, updateDoc, deleteDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { OfflineQueueService } from '../queue';
import { ConnectivityService } from '../connectivity';
import { ReconciliationEngine } from '../reconciliation';

export class SyncEngineService {
  private static isSyncingInProgress = false;
  private static syncIntervalId: any = null;

  /**
   * Initializes real-time listener monitors for online/offline and background resume signals
   */
  public static initialize(): void {
    if (typeof window === 'undefined') return;

    // 1. Connectivity change hook triggers immediate outbound flush
    ConnectivityService.subscribe((state) => {
      if (state.isOnline) {
        this.syncNow();
      }
    });

    // 2. Window visibility changes (conserves device energy in fields, flushes upon refocus)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && ConnectivityService.getState().isOnline) {
        this.syncNow();
      }
    });

    // 3. Setup lightweight interval-driven syncing for active user edits
    this.startIntervalBasedSync();
  }

  public static destroy(): void {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
    }
  }

  /**
   * Main Queue Flush Routine with transaction serialization
   */
  public static async syncNow(): Promise<boolean> {
    if (this.isSyncingInProgress) {
      return false;
    }

    const { isOnline } = ConnectivityService.getState();
    if (!isOnline) {
      return false;
    }

    const pending = await OfflineQueueService.getPending();
    if (pending.length === 0) {
      return true;
    }

    this.isSyncingInProgress = true;
    console.log(`%c[Sync Engine] Flushing sync pipeline: Processing ${pending.length} modifications...`, 'color: #9333ea; font-weight: bold;');

    let successCount = 0;

    for (const mutation of pending) {
      try {
        await OfflineQueueService.markSyncing(mutation.id);

        const docRef = doc(db, mutation.collection, mutation.targetId);

        // Standard operational conflict evaluation prior to cloud write
        let writePayload = { ...mutation.payload };

        if (mutation.type === 'create') {
          const payloadWithTime = {
            ...writePayload,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };
          await setDoc(docRef, payloadWithTime, { merge: true });
        } 
        else if (mutation.type === 'update') {
          // Perform lightweight Last-Write-Wins resolution in case server already contains newer data
          try {
            const serverDocSnap = await getDoc(docRef);
            if (serverDocSnap.exists()) {
              const serverData = serverDocSnap.data();
              const { resolvedDoc } = ReconciliationEngine.reconcile(
                mutation.collection,
                mutation.targetId,
                writePayload,
                serverData,
                'last-write-wins'
              );
              writePayload = resolvedDoc;
            }
          } catch (err) {
            console.log('[Sync Engine] Soft-skip online resolution fetch (offline/permissions boundary)', err);
          }

          const payloadWithTime = {
            ...writePayload,
            updatedAt: serverTimestamp()
          };
          await updateDoc(docRef, payloadWithTime);
        } 
        else if (mutation.type === 'delete') {
          await deleteDoc(docRef);
        }

        // Successfully integrated! Remove from IndexedDB queue
        await OfflineQueueService.dequeue(mutation.id);
        successCount++;
      } catch (error: any) {
        const errorMsg = error?.message || String(error);
        await OfflineQueueService.markFailed(mutation.id, errorMsg);

        // Safety break: if connection drops halfway or hits a storage permission leak, halt queue flushing
        if (
          errorMsg.includes('offline') || 
          errorMsg.includes('network') || 
          errorMsg.includes('Quota exceeded') ||
          errorMsg.includes('permission')
        ) {
          console.warn('[Sync Engine] Structural crash during transmission queue flush. Halting.', errorMsg);
          break;
        }
      }
    }

    this.isSyncingInProgress = false;
    
    const recheckedPending = await OfflineQueueService.getPending();
    return recheckedPending.length === 0;
  }

  private static startIntervalBasedSync() {
    if (this.syncIntervalId) clearInterval(this.syncIntervalId);

    this.syncIntervalId = setInterval(() => {
      this.syncNow();
    }, 20000); // Trigger sync every 20 seconds during operational cycles
  }
}
