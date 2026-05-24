/**
 * Client Offline Persistence Cache layer for DDSulf
 */

import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { app } from '../config';

/**
 * Initializes Firestore with multiple tab cache persistent memory support
 */
export function configureClientOfflinePersistence() {
  if (typeof window === 'undefined') return null;

  try {
    const firestoreDb = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    });
    console.log('%c📦 [Offline Cache] Enabled persistent SQLite/IndexedDB multiple tab storage.', 'color: #9333ea;');
    return firestoreDb;
  } catch (err) {
    console.warn('[Offline Cache] Persistent local cache could not be initialized. Defaulting to memory cache.', err);
    return null;
  }
}
