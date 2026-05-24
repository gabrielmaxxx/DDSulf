/**
 * DDSulf Persistence Engine - Resilient Promise-based IndexedDB Connector
 * Manages atomic offline tables: mutations, draft wizards, local indicators cache, and preferences.
 */

const DB_NAME = 'ddsulf_operational_master';
const DB_VERSION = 1;

export const STORES = {
  MUTATIONS_QUEUE: 'mutations_queue',
  DRAFTS: 'drafts',
  SNAPSHOTS_CACHE: 'snapshots_cache',
  SETTINGS: 'local_settings'
} as const;

export class DDSulfIndexedDB {
  private static dbInstance: IDBDatabase | null = null;

  public static async getDB(): Promise<IDBDatabase> {
    if (this.dbInstance) return this.dbInstance;

    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('IndexedDB is only accessible in browser execution environments.'));
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = request.result;
        
        // 1. Store containing transactional offline mutations to play back later
        if (!db.objectStoreNames.contains(STORES.MUTATIONS_QUEUE)) {
          db.createObjectStore(STORES.MUTATIONS_QUEUE, { keyPath: 'id' });
        }

        // 2. Store safeguarding multi-step document wizards & unfinished checklists (autosave)
        if (!db.objectStoreNames.contains(STORES.DRAFTS)) {
          db.createObjectStore(STORES.DRAFTS, { keyPath: 'id' });
        }

        // 3. Cache catalogs for financial calculations, POP instructions, and dashboard grids
        if (!db.objectStoreNames.contains(STORES.SNAPSHOTS_CACHE)) {
          db.createObjectStore(STORES.SNAPSHOTS_CACHE, { keyPath: 'id' });
        }

        // 4. Client offline metrics, thresholds, local chemical cost simulator parameters
        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          db.createObjectStore(STORES.SETTINGS, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => {
        this.dbInstance = request.result;
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error || new Error('Could not open IndexedDB master persistence instance.'));
      };
    });
  }

  /**
   * Safe transaction wrapper with auto-close guarantees
   */
  public static async execute<T = any>(
    storeName: string,
    mode: IDBTransactionMode,
    callback: (store: IDBObjectStore) => IDBRequest
  ): Promise<T> {
    const db = await this.getDB();
    return new Promise<T>((resolve, reject) => {
      const transaction = db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);
      const request = callback(store);

      request.onsuccess = () => {
        resolve(request.result as T);
      };

      request.onerror = () => {
        reject(request.error || new Error(`IndexedDB direct error in store: ${storeName}`));
      };
    });
  }

  /**
   * Atomic operations helper for fast queries
   */
  public static async get<T>(storeName: string, key: string): Promise<T | null> {
    try {
      const result = await this.execute<T>(storeName, 'readonly', store => store.get(key));
      return result || null;
    } catch (err) {
      console.warn(`[IDB Persistence] GET error on ${storeName}/${key}`, err);
      return null;
    }
  }

  public static async put<T>(storeName: string, value: T): Promise<void> {
    try {
      await this.execute<void>(storeName, 'readwrite', store => store.put(value));
    } catch (err) {
      console.error(`[IDB Persistence] PUT failure on ${storeName}`, err);
    }
  }

  public static async delete(storeName: string, key: string): Promise<void> {
    try {
      await this.execute<void>(storeName, 'readwrite', store => store.delete(key));
    } catch (err) {
      console.error(`[IDB Persistence] DELETE failure on ${storeName}/${key}`, err);
    }
  }

  public static async getAll<T>(storeName: string): Promise<T[]> {
    try {
      return await this.execute<T[]>(storeName, 'readonly', store => store.getAll());
    } catch (err) {
      console.warn(`[IDB Persistence] GETALL error on ${storeName}`, err);
      return [];
    }
  }

  public static async clear(storeName: string): Promise<void> {
    try {
      await this.execute<void>(storeName, 'readwrite', store => store.clear());
    } catch (err) {
      console.error(`[IDB Persistence] CLEAR failure on ${storeName}`, err);
    }
  }
}
