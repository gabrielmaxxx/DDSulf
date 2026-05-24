/**
 * Enterprise Data Synchronization State Service
 */

import { doc, getDoc, updateDoc, setDoc, serverTimestamp, runTransaction } from 'firebase/firestore';
import { db } from '../config';
import { handleFirestoreError } from '../utils/errorHandler';
import { OperationType } from '../types';

export interface SyncMetadata {
  id: string; // collection name or client hash
  lastSyncedAt: string;
  revision: number;
}

export class SyncMetadataService {
  private static collectionName = 'sync_metadata';

  /**
   * Safe transaction-checked update of database sync indices
   */
  public static async registerSyncPulse(collection: string): Promise<void> {
    const docRef = doc(db, this.collectionName, collection);

    try {
      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(docRef);
        const currentRev = snap.exists() ? (snap.data().revision || 0) : 0;
        
        transaction.set(docRef, {
          id: collection,
          lastSyncedAt: new Date().toISOString(),
          revision: currentRev + 1,
          updatedAt: serverTimestamp()
        }, { merge: true });
      });
    } catch (err) {
      // Offline safe - print message but do not throw
      console.warn(`[SyncMetadataService] Sync pulse skipped during offline mode: ${collection}`, err);
    }
  }

  /**
   * Retrieves current sync timestamps to verify if local storage indices are stale
   */
  public static async getCollectionRevision(collection: string): Promise<number> {
    try {
      const docRef = doc(db, this.collectionName, collection);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return 0;
      return snap.data().revision || 0;
    } catch {
      return 0; // Return zero during offline scenarios
    }
  }
}
