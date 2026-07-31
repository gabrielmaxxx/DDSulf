/**
 * Base Abstract Repository Pattern implementation for DDSulf Multi-Tenant
 * Provides type-safe isolated CRUD access with precise error parsing wrappers and tenant scoping.
 * Requires mandatory empresaId parameter on all operations to ensure strict multi-tenant isolation.
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
import { getTenantCollectionPath } from '../../tenant';

export abstract class BaseRepository<T extends { id?: string }> {
  protected abstract readonly collectionName: string;

  protected getTenantPath(empresaId: string): string {
    if (!empresaId) {
      throw new Error('empresaId é obrigatório para acesso a dados multi-tenant');
    }
    return getTenantCollectionPath(empresaId, this.collectionName);
  }

  public async getById(empresaId: string, id: string): Promise<T | null> {
    if (!empresaId) {
      throw new Error('empresaId é obrigatório para acesso a dados multi-tenant');
    }
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

  public async save(empresaId: string, id: string, data: Partial<T>): Promise<void> {
    if (!empresaId) {
      throw new Error('empresaId é obrigatório para acesso a dados multi-tenant');
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

  public async update(empresaId: string, id: string, data: Partial<T>): Promise<void> {
    if (!empresaId) {
      throw new Error('empresaId é obrigatório para acesso a dados multi-tenant');
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

  public async delete(empresaId: string, id: string): Promise<void> {
    if (!empresaId) {
      throw new Error('empresaId é obrigatório para acesso a dados multi-tenant');
    }
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

  public async listAll(empresaId: string, limitCount = 100): Promise<T[]> {
    if (!empresaId) {
      throw new Error('empresaId é obrigatório para acesso a dados multi-tenant');
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
