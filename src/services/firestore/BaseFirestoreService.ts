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
import { getTenantCollectionPath, DEFAULT_EMPRESA_ID } from '@/tenant';

/**
 * Enterprise Base Firestore Service Multi-Tenant
 * Encapsulates advanced data collection manipulations, transaction integrity and robust state handlers.
 * Supports flexible polymorphic call signatures:
 * - getById(id) OR getById(empresaId, id)
 * - list(params) OR list(empresaId, params)
 * - create(data) OR create(empresaId, data)
 * - update(id, data) OR update(empresaId, id, data)
 */
export class BaseFirestoreService<T extends { id?: string; createdAt?: string; updatedAt?: string }> {
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  /**
   * Generates tenant-scoped collection path
   */
  protected getTenantPath(empresaId: string = DEFAULT_EMPRESA_ID): string {
    // TODO(fase-2): substituir por empresaId extraído do custom claim do token
    if (this.collectionName.startsWith('empresas/')) {
      return this.collectionName;
    }
    return getTenantCollectionPath(empresaId, this.collectionName);
  }

  /**
   * Reference collection locator helper
   */
  protected getCollectionRef(empresaId: string = DEFAULT_EMPRESA_ID): CollectionReference {
    // TODO(fase-2): substituir por empresaId extraído do custom claim do token
    return collection(db, this.getTenantPath(empresaId));
  }

  /**
   * Generates typed DocumentReference based on target record uuid
   */
  protected getDocRef(empresaId: string = DEFAULT_EMPRESA_ID, id: string): DocumentReference {
    // TODO(fase-2): substituir por empresaId extraído do custom claim do token
    return doc(db, this.getTenantPath(empresaId), id);
  }

  /**
   * Central wrapper to safely request database operations
   */
  protected async safeExecute<R>(operationName: string, action: () => Promise<R>, empresaId: string = DEFAULT_EMPRESA_ID): Promise<R> {
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
  async getById(id: string): Promise<T | null>;
  async getById(empresaId: string, id: string): Promise<T | null>;
  async getById(arg1: string, arg2?: string): Promise<T | null> {
    // TODO(fase-2): substituir por empresaId extraído do custom claim do token
    const empresaId = arg2 ? arg1 : DEFAULT_EMPRESA_ID;
    const id = arg2 ? arg2 : arg1;

    return this.safeExecute(`getById(${id})`, async () => {
      const snap = await getDoc(this.getDocRef(empresaId, id));
      if (!snap.exists()) return null;
      return FirestoreAdapters.normalizeEntity<T>(snap.data(), snap.id);
    }, empresaId);
  }

  /**
   * Structured multi-record queries with complete filter definitions in tenant scope
   */
  async list(params?: QueryParams): Promise<T[]>;
  async list(empresaId: string, params?: QueryParams): Promise<T[]>;
  async list(arg1?: QueryParams | string, arg2?: QueryParams): Promise<T[]> {
    // TODO(fase-2): substituir por empresaId extraído do custom claim do token
    let empresaId = DEFAULT_EMPRESA_ID;
    let params: QueryParams = {};

    if (typeof arg1 === 'string') {
      empresaId = arg1;
      params = arg2 || {};
    } else if (typeof arg1 === 'object' && arg1 !== null) {
      params = arg1;
    }

    return this.safeExecute('list', async () => {
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
    }, empresaId);
  }

  /**
   * Provision a fresh document to the assigned collection path in tenant scope
   */
  async create(data: Partial<T> & { id?: string }): Promise<T>;
  async create(empresaId: string, data: Partial<T> & { id?: string }): Promise<T>;
  async create(arg1: any, arg2?: any): Promise<T> {
    // TODO(fase-2): substituir por empresaId extraído do custom claim do token
    let empresaId = DEFAULT_EMPRESA_ID;
    let data: Partial<T> & { id?: string };

    if (typeof arg1 === 'string') {
      empresaId = arg1;
      data = arg2;
    } else {
      data = arg1;
    }

    return this.safeExecute('create', async () => {
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
    }, empresaId);
  }

  /**
   * Symmetrically updates structural records in tenant scope
   */
  async update(id: string, data: Partial<T>): Promise<void>;
  async update(empresaId: string, id: string, data: Partial<T>): Promise<void>;
  async update(arg1: string, arg2: any, arg3?: any): Promise<void> {
    // TODO(fase-2): substituir por empresaId extraído do custom claim do token
    let empresaId = DEFAULT_EMPRESA_ID;
    let id: string;
    let data: Partial<T>;

    if (typeof arg2 === 'string') {
      empresaId = arg1;
      id = arg2;
      data = arg3;
    } else {
      id = arg1;
      data = arg2;
    }

    return this.safeExecute(`update(${id})`, async () => {
      const payload = {
        ...data,
        updatedAt: new Date().toISOString()
      };
      
      delete (payload as any).id;
      delete (payload as any).createdAt;

      await updateDoc(this.getDocRef(empresaId, id), payload as any);
    }, empresaId);
  }

  /**
   * Perform soft delete in tenant scope
   */
  async softDelete(id: string): Promise<void>;
  async softDelete(empresaId: string, id: string): Promise<void>;
  async softDelete(arg1: string, arg2?: string): Promise<void> {
    // TODO(fase-2): substituir por empresaId extraído do custom claim do token
    const empresaId = arg2 ? arg1 : DEFAULT_EMPRESA_ID;
    const id = arg2 ? arg2 : arg1;

    return this.safeExecute(`softDelete(${id})`, async () => {
      await updateDoc(this.getDocRef(empresaId, id), {
        deleted: true,
        updatedAt: new Date().toISOString()
      });
    }, empresaId);
  }

  /**
   * Physical deletion in tenant scope
   */
  async hardDelete(id: string): Promise<void>;
  async hardDelete(empresaId: string, id: string): Promise<void>;
  async hardDelete(arg1: string, arg2?: string): Promise<void> {
    // TODO(fase-2): substituir por empresaId extraído do custom claim do token
    const empresaId = arg2 ? arg1 : DEFAULT_EMPRESA_ID;
    const id = arg2 ? arg2 : arg1;

    return this.safeExecute(`hardDelete(${id})`, async () => {
      await deleteDoc(this.getDocRef(empresaId, id));
    }, empresaId);
  }

  /**
   * Subscribes to real-time updates for a single element
   */
  subscribeDoc(id: string, callback: (data: T | null) => void): () => void;
  subscribeDoc(empresaId: string, id: string, callback: (data: T | null) => void): () => void;
  subscribeDoc(arg1: string, arg2: any, arg3?: any): () => void {
    // TODO(fase-2): substituir por empresaId extraído do custom claim do token
    let empresaId = DEFAULT_EMPRESA_ID;
    let id: string;
    let callback: (data: T | null) => void;

    if (typeof arg2 === 'string') {
      empresaId = arg1;
      id = arg2;
      callback = arg3;
    } else {
      id = arg1;
      callback = arg2;
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
  subscribeList(callback: (data: T[]) => void): () => void;
  subscribeList(params: QueryParams, callback: (data: T[]) => void): () => void;
  subscribeList(empresaId: string, params: QueryParams, callback: (data: T[]) => void): () => void;
  subscribeList(arg1: any, arg2?: any, arg3?: any): () => void {
    // TODO(fase-2): substituir por empresaId extraído do custom claim do token
    let empresaId = DEFAULT_EMPRESA_ID;
    let params: QueryParams = {};
    let callback: (data: T[]) => void;

    if (typeof arg1 === 'function') {
      callback = arg1;
    } else if (typeof arg2 === 'function') {
      params = arg1;
      callback = arg2;
    } else {
      empresaId = arg1;
      params = arg2;
      callback = arg3;
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
