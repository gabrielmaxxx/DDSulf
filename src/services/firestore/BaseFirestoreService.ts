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
  DocumentReference
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import { QueryBuilder, QueryParams } from './QueryBuilder';
import { FirestoreAdapters } from './FirestoreAdapters';
import { logOperationalEvent } from '@/firebase/analytics';
import { getTenantCollectionPath } from '@/tenant';

/**
 * Enterprise Base Firestore Service Multi-Tenant
 * Encapsulates advanced data collection manipulations, transaction integrity and robust state handlers.
 * Requires mandatory empresaId parameter on all operations for strict multi-tenant isolation.
 */
export class BaseFirestoreService<T extends { id?: string; createdAt?: string; updatedAt?: string }> {
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  /**
   * Generates tenant-scoped collection path
   */
  protected getTenantPath(empresaId: string): string {
    if (!empresaId) {
      throw new Error('empresaId é obrigatório para acesso a dados multi-tenant');
    }
    if (this.collectionName.startsWith('empresas/')) {
      return this.collectionName;
    }
    return getTenantCollectionPath(empresaId, this.collectionName);
  }

  /**
   * Reference collection locator helper
   */
  protected getCollectionRef(empresaId: string): CollectionReference {
    return collection(db, this.getTenantPath(empresaId));
  }

  /**
   * Generates typed DocumentReference based on target record uuid
   */
  protected getDocRef(empresaId: string, id: string): DocumentReference {
    return doc(db, this.getTenantPath(empresaId), id);
  }

  /**
   * Central wrapper to safely request database operations
   */
  protected async safeExecute<R>(operationName: string, empresaId: string, action: () => Promise<R>): Promise<R> {
    if (!empresaId) {
      throw new Error('empresaId é obrigatório para acesso a dados multi-tenant');
    }
    const start = Date.now();
    const currentPath = this.getTenantPath(empresaId);
    try {
      const result = await action();
      const latency = Date.now() - start;
      logOperationalEvent('firestore_io_latency', { 
        operation: operationName, 
        collection: currentPath, 
        latencyMs: latency 
      });
      return result;
    } catch (error: any) {
      logOperationalEvent('firestore_io_error', { 
        operation: operationName, 
        collection: currentPath, 
        errorMessage: error.message || String(error) 
      });
      console.error(`[BaseFirestoreService] Io failure during ${operationName} on ${currentPath}:`, error);
      throw error;
    }
  }

  /**
   * Retrieve single item by identification key in tenant scope
   */
  async getById(empresaId: string, id: string): Promise<T | null> {
    if (!empresaId) {
      throw new Error('empresaId é obrigatório para acesso a dados multi-tenant');
    }
    return this.safeExecute(`getById(${id})`, empresaId, async () => {
      const snap = await getDoc(this.getDocRef(empresaId, id));
      if (!snap.exists()) return null;
      return FirestoreAdapters.normalizeEntity<T>(snap.data(), snap.id);
    });
  }

  /**
   * Structured multi-record queries with complete filter definitions in tenant scope
   */
  async list(empresaId: string, params: QueryParams = {}): Promise<T[]> {
    if (!empresaId) {
      throw new Error('empresaId é obrigatório para acesso a dados multi-tenant');
    }
    return this.safeExecute('list', empresaId, async () => {
      const processedParams = { ...params };
      if (!processedParams.filters) {
        processedParams.filters = [];
      }
      
      const hasActiveDeletionFilter = processedParams.filters.some(f => f.field === 'deleted');
      if (!hasActiveDeletionFilter) {
        processedParams.filters.push({ field: 'deleted', operator: '!=', value: true });
      }

      const builtQuery = QueryBuilder.build(this.getCollectionRef(empresaId), processedParams);
      const snap = await getDocs(builtQuery);
      return snap.docs.map(d => FirestoreAdapters.normalizeEntity<T>(d.data(), d.id));
    });
  }

  /**
   * Provision a fresh document to the assigned collection path in tenant scope
   */
  async create(empresaId: string, data: Partial<T> & { id?: string }): Promise<T> {
    if (!empresaId) {
      throw new Error('empresaId é obrigatório para acesso a dados multi-tenant');
    }
    return this.safeExecute('create', empresaId, async () => {
      const payload = {
        ...data,
        deleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      let docId = data.id;
      if (docId) {
        await setDoc(this.getDocRef(empresaId, docId), payload);
      } else {
        const addedRef = await addDoc(this.getCollectionRef(empresaId), payload);
        docId = addedRef.id;
      }

      return { id: docId, ...payload } as unknown as T;
    });
  }

  /**
   * Symmetrically updates structural records in tenant scope
   */
  async update(empresaId: string, id: string, data: Partial<T>): Promise<void> {
    if (!empresaId) {
      throw new Error('empresaId é obrigatório para acesso a dados multi-tenant');
    }
    return this.safeExecute(`update(${id})`, empresaId, async () => {
      const payload = {
        ...data,
        updatedAt: new Date().toISOString()
      };
      
      delete (payload as any).id;
      delete (payload as any).createdAt;

      await updateDoc(this.getDocRef(empresaId, id), payload as any);
    });
  }

  /**
   * Perform soft delete in tenant scope
   */
  async softDelete(empresaId: string, id: string): Promise<void> {
    if (!empresaId) {
      throw new Error('empresaId é obrigatório para acesso a dados multi-tenant');
    }
    return this.safeExecute(`softDelete(${id})`, empresaId, async () => {
      await updateDoc(this.getDocRef(empresaId, id), {
        deleted: true,
        updatedAt: new Date().toISOString()
      });
    });
  }

  /**
   * Physical deletion in tenant scope
   */
  async hardDelete(empresaId: string, id: string): Promise<void> {
    if (!empresaId) {
      throw new Error('empresaId é obrigatório para acesso a dados multi-tenant');
    }
    return this.safeExecute(`hardDelete(${id})`, empresaId, async () => {
      await deleteDoc(this.getDocRef(empresaId, id));
    });
  }

  /**
   * Subscribes to real-time updates for a single element
   */
  subscribeDoc(empresaId: string, id: string, callback: (data: T | null) => void): () => void {
    if (!empresaId) {
      throw new Error('empresaId é obrigatório para acesso a dados multi-tenant');
    }
    const ref = this.getDocRef(empresaId, id);
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
  subscribeList(empresaId: string, callback: (data: T[]) => void): () => void;
  subscribeList(empresaId: string, params: QueryParams, callback: (data: T[]) => void): () => void;
  subscribeList(empresaId: string, arg2: QueryParams | ((data: T[]) => void), arg3?: (data: T[]) => void): () => void {
    if (!empresaId) {
      throw new Error('empresaId é obrigatório para acesso a dados multi-tenant');
    }
    let params: QueryParams = {};
    let callback: (data: T[]) => void;

    if (typeof arg2 === 'function') {
      callback = arg2;
    } else {
      params = arg2 || {};
      callback = arg3!;
    }

    const processedParams = { ...params };
    if (!processedParams.filters) {
      processedParams.filters = [];
    }
    const hasDeletionFilter = processedParams.filters.some(f => f.field === 'deleted');
    if (!hasDeletionFilter) {
      processedParams.filters.push({ field: 'deleted', operator: '!=', value: true });
    }

    const ref = QueryBuilder.build(this.getCollectionRef(empresaId), processedParams);
    return onSnapshot(ref, (snap) => {
      const items = snap.docs.map(docSnap => 
        FirestoreAdapters.normalizeEntity<T>(docSnap.data(), docSnap.id)
      );
      callback(items);
    }, (error) => {
      console.error(`[BaseFirestoreService] Real-time list sub error:`, error);
    });
  }

  async runAtomicTransaction<R>(block: (transaction: any) => Promise<R>): Promise<R> {
    return runTransaction(db, block);
  }

  async executeWriteBatch(action: (batch: ReturnType<typeof writeBatch>) => void): Promise<void> {
    const batch = writeBatch(db);
    action(batch);
    await batch.commit();
  }
}

export default BaseFirestoreService;
