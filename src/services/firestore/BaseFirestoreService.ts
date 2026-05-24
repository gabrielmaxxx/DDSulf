import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch, 
  runTransaction,
  CollectionReference,
  DocumentReference,
  DocumentSnapshot,
  QuerySnapshot
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { QueryBuilder, QueryParams } from './QueryBuilder';
import { FirestoreAdapters } from './FirestoreAdapters';
import { logOperationalEvent } from '@/firebase/analytics';

/**
 * Enterprise Base Firestore Service
 * Encapsulates advanced data collection manipulations, transaction integrity and robust state handlers
 */
export class BaseFirestoreService<T extends { id?: string; createdAt?: string; updatedAt?: string }> {
  protected collectionPath: string;

  constructor(collectionPath: string) {
    this.collectionPath = collectionPath;
  }

  /**
   * Reference collection locator helper
   */
  protected getCollectionRef(): CollectionReference {
    return collection(db, this.collectionPath);
  }

  /**
   * Generates typed DocumentReference based on target record uuid
   */
  protected getDocRef(id: string): DocumentReference {
    return doc(db, this.collectionPath, id);
  }

  /**
   * Central wrapper to safely request database operations with localized diagnostic retries
   */
  protected async safeExecute<R>(operationName: string, action: () => Promise<R>): Promise<R> {
    const start = Date.now();
    try {
      const result = await action();
      const latency = Date.now() - start;
      logOperationalEvent('firestore_io_latency', { 
        operation: operationName, 
        collection: this.collectionPath, 
        latencyMs: latency 
      });
      return result;
    } catch (error: any) {
      logOperationalEvent('firestore_io_error', { 
        operation: operationName, 
        collection: this.collectionPath, 
        errorMessage: error.message || String(error) 
      });
      console.error(`[BaseFirestoreService] Io failure during ${operationName} on ${this.collectionPath}:`, error);
      throw error;
    }
  }

  /**
   * Retrieve single item by identification key
   */
  async getById(id: string): Promise<T | null> {
    return this.safeExecute(`getById(${id})`, async () => {
      const snap = await getDoc(this.getDocRef(id));
      if (!snap.exists()) return null;
      return FirestoreAdapters.normalizeEntity<T>(snap.data(), snap.id);
    });
  }

  /**
   * Structured multi-record queries with complete filter definitions
   */
  async list(params: QueryParams = {}): Promise<T[]> {
    return this.safeExecute('list', async () => {
      // Direct integration check avoids reading logical soft-deleted entries by default
      const processedParams = { ...params };
      if (!processedParams.filters) {
        processedParams.filters = [];
      }
      
      const hasActiveDeletionFilter = processedParams.filters.some(f => f.field === 'deleted');
      if (!hasActiveDeletionFilter) {
        processedParams.filters.push({ field: 'deleted', operator: '!=', value: true });
      }

      const builtQuery = QueryBuilder.build(this.getCollectionRef(), processedParams);
      const snap = await getDocs(builtQuery);
      return snap.docs.map(d => FirestoreAdapters.normalizeEntity<T>(d.data(), d.id));
    });
  }

  /**
   * Provision a fresh document to the assigned collection path
   */
  async create(data: Partial<T> & { id?: string }): Promise<T> {
    return this.safeExecute('create', async () => {
      const payload = {
        ...data,
        deleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      let docId = data.id;
      if (docId) {
        await setDoc(this.getDocRef(docId), payload);
      } else {
        const addedRef = await addDoc(this.getCollectionRef(), payload);
        docId = addedRef.id;
      }

      return { id: docId, ...payload } as unknown as T;
    });
  }

  /**
   * Symmetrically updates structural records on Firestore updates
   */
  async update(id: string, data: Partial<T>): Promise<void> {
    return this.safeExecute(`update(${id})`, async () => {
      const payload = {
        ...data,
        updatedAt: new Date().toISOString()
      };
      
      // Auto strip out structural fields to prevent mapping bugs
      delete (payload as any).id;
      delete (payload as any).createdAt;

      await updateDoc(this.getDocRef(id), payload as any);
    });
  }

  /**
   * Perform professional analytical soft delete metrics
   */
  async softDelete(id: string): Promise<void> {
    return this.safeExecute(`softDelete(${id})`, async () => {
      await updateDoc(this.getDocRef(id), {
        deleted: true,
        updatedAt: new Date().toISOString()
      });
    });
  }

  /**
   * Complete physical deletion when required by the domain action
   */
  async hardDelete(id: string): Promise<void> {
    return this.safeExecute(`hardDelete(${id})`, async () => {
      await deleteDoc(this.getDocRef(id));
    });
  }

  /**
   * Subscribes to real-time updates for a single element with reactive callbacks
   */
  subscribeDoc(id: string, callback: (data: T | null) => void): () => void {
    const ref = this.getDocRef(id);
    return onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        callback(FirestoreAdapters.normalizeEntity<T>(snap.data(), snap.id));
      } else {
        callback(null);
      }
    }, (error) => {
      console.error(`[BaseFirestoreService] Real-time sub error on id ${id}:`, error);
    });
  }

  /**
   * Reactive dynamic list updates listener subscription
   */
  subscribeList(params: QueryParams = {}, callback: (data: T[]) => void): () => void {
    const processedParams = { ...params };
    if (!processedParams.filters) {
      processedParams.filters = [];
    }
    const hasDeletionFilter = processedParams.filters.some(f => f.field === 'deleted');
    if (!hasDeletionFilter) {
      processedParams.filters.push({ field: 'deleted', operator: '!=', value: true });
    }

    const ref = QueryBuilder.build(this.getCollectionRef(), processedParams);
    return onSnapshot(ref, (snap) => {
      const items = snap.docs.map(docSnap => 
        FirestoreAdapters.normalizeEntity<T>(docSnap.data(), docSnap.id)
      );
      callback(items);
    }, (error) => {
      console.error(`[BaseFirestoreService] Real-time list sub error:`, error);
    });
  }

  /**
   * Single generic atomic transaction coordinator execute action
   */
  async runAtomicTransaction<R>(block: (transaction: any) => Promise<R>): Promise<R> {
    return runTransaction(db, block);
  }

  /**
   * Standard batch manager wrapper initialization helper
   */
  async executeWriteBatch(action: (batch: ReturnType<typeof writeBatch>) => void): Promise<void> {
    const batch = writeBatch(db);
    action(batch);
    await batch.commit();
  }
}

export default BaseFirestoreService;
