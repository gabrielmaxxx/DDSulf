/**
 * Base Abstract Repository Pattern implementation for DDSulf Multi-Tenant
 * Provides type-safe isolated CRUD access with precise error parsing wrappers and tenant scoping.
 * Supports flexible polymorphic call signatures:
 * - getById(id) OR getById(empresaId, id)
 * - save(id, data) OR save(empresaId, id, data)
 * - update(id, data) OR update(empresaId, id, data)
 * - delete(id) OR delete(empresaId, id)
 * - listAll(limitCount) OR listAll(empresaId, limitCount)
 */

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  collection,
  getDocs
} from 'firebase/firestore';
import { auth, db } from '../config';
import { handleFirestoreError } from '../utils/errorHandler';
import { OperationType } from '../types';
import { getTenantCollectionPath, DEFAULT_EMPRESA_ID } from '../../tenant';

export abstract class BaseRepository<T extends { id?: string }> {
  protected abstract readonly collectionName: string;

  protected getTenantPath(empresaId: string = DEFAULT_EMPRESA_ID): string {
    // TODO(fase-2): substituir por empresaId extraído do custom claim do token
    return getTenantCollectionPath(empresaId, this.collectionName);
  }

  public async getById(id: string): Promise<T | null>;
  public async getById(empresaId: string, id: string): Promise<T | null>;
  public async getById(arg1: string, arg2?: string): Promise<T | null> {
    // TODO(fase-2): substituir por empresaId extraído do custom claim do token
    const empresaId = arg2 ? arg1 : DEFAULT_EMPRESA_ID;
    const id = arg2 ? arg2 : arg1;

    if (!auth.currentUser) {
      console.warn(`[BaseRepository] Skipping getById for '${this.getTenantPath(empresaId)}/${id}': No active Firebase user.`);
      return null;
    }
    const path = this.getTenantPath(empresaId);
    const fullPath = `${path}/${id}`;
    try {
      const docRef = doc(db, path, id);
      const snap = await getDoc(docRef);
      if (!snap.exists()) {
        return null;
      }
      return { id: snap.id, ...snap.data() } as T;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, fullPath);
      return null;
    }
  }

  public async save(id: string, data: Partial<T>): Promise<void>;
  public async save(empresaId: string, id: string, data: Partial<T>): Promise<void>;
  public async save(arg1: string, arg2: any, arg3?: any): Promise<void> {
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

    if (!auth.currentUser) {
      console.warn(`[BaseRepository] Skipping save for '${this.getTenantPath(empresaId)}/${id}': No active Firebase user.`);
      return;
    }
    const path = this.getTenantPath(empresaId);
    const fullPath = `${path}/${id}`;
    try {
      const docRef = doc(db, path, id);
      const payload = {
        ...data,
        id,
        createdAt: (data as any).createdAt || serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(docRef, payload, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, fullPath);
    }
  }

  public async update(id: string, data: Partial<T>): Promise<void>;
  public async update(empresaId: string, id: string, data: Partial<T>): Promise<void>;
  public async update(arg1: string, arg2: any, arg3?: any): Promise<void> {
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

    if (!auth.currentUser) {
      console.warn(`[BaseRepository] Skipping update for '${this.getTenantPath(empresaId)}/${id}': No active Firebase user.`);
      return;
    }
    const path = this.getTenantPath(empresaId);
    const fullPath = `${path}/${id}`;
    try {
      const docRef = doc(db, path, id);
      const payload = {
        ...data,
        updatedAt: serverTimestamp(),
      };
      await updateDoc(docRef, payload);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, fullPath);
    }
  }

  public async delete(id: string): Promise<void>;
  public async delete(empresaId: string, id: string): Promise<void>;
  public async delete(arg1: string, arg2?: string): Promise<void> {
    // TODO(fase-2): substituir por empresaId extraído do custom claim do token
    const empresaId = arg2 ? arg1 : DEFAULT_EMPRESA_ID;
    const id = arg2 ? arg2 : arg1;

    if (!auth.currentUser) {
      console.warn(`[BaseRepository] Skipping delete for '${this.getTenantPath(empresaId)}/${id}': No active Firebase user.`);
      return;
    }
    const path = this.getTenantPath(empresaId);
    const fullPath = `${path}/${id}`;
    try {
      const docRef = doc(db, path, id);
      await deleteDoc(docRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, fullPath);
    }
  }

  public async listAll(limitCount?: number): Promise<T[]>;
  public async listAll(empresaId: string, limitCount?: number): Promise<T[]>;
  public async listAll(arg1?: any, arg2?: any): Promise<T[]> {
    // TODO(fase-2): substituir por empresaId extraído do custom claim do token
    let empresaId = DEFAULT_EMPRESA_ID;
    let limitCount = 100;

    if (typeof arg1 === 'string') {
      empresaId = arg1;
      limitCount = arg2 || 100;
    } else if (typeof arg1 === 'number') {
      limitCount = arg1;
    }

    if (!auth.currentUser) {
      console.warn(`[BaseRepository] Skipping listAll for '${this.getTenantPath(empresaId)}': No active Firebase user.`);
      return [];
    }
    const path = this.getTenantPath(empresaId);
    try {
      const colRef = collection(db, path);
      const snap = await getDocs(colRef);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as T);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
      return [];
    }
  }
}
