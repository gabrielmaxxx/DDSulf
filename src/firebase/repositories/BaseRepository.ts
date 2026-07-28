/**
 * Base Abstract Repository Pattern implementation for DDSulf
 * Provides type-safe isolated CRUD access with precise error parsing wrappers.
 */

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  collection,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { auth, db } from '../config';
import { handleFirestoreError } from '../utils/errorHandler';
import { OperationType } from '../types';

export abstract class BaseRepository<T extends { id?: string }> {
  protected abstract readonly collectionName: string;

  public async getById(id: string): Promise<T | null> {
    if (!auth.currentUser) {
      console.warn(`[BaseRepository] Skipping getById for '${this.collectionName}/${id}': No active Firebase user.`);
      return null;
    }
    const path = `${this.collectionName}/${id}`;
    try {
      const docRef = doc(db, this.collectionName, id);
      const snap = await getDoc(docRef);
      if (!snap.exists()) {
        return null;
      }
      return { id: snap.id, ...snap.data() } as T;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return null;
    }
  }

  public async save(id: string, data: Partial<T>): Promise<void> {
    if (!auth.currentUser) {
      console.warn(`[BaseRepository] Skipping save for '${this.collectionName}/${id}': No active Firebase user.`);
      return;
    }
    const path = `${this.collectionName}/${id}`;
    try {
      const docRef = doc(db, this.collectionName, id);
      const payload = {
        ...data,
        id,
        createdAt: (data as any).createdAt || serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(docRef, payload, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  }

  public async update(id: string, data: Partial<T>): Promise<void> {
    if (!auth.currentUser) {
      console.warn(`[BaseRepository] Skipping update for '${this.collectionName}/${id}': No active Firebase user.`);
      return;
    }
    const path = `${this.collectionName}/${id}`;
    try {
      const docRef = doc(db, this.collectionName, id);
      const payload = {
        ...data,
        updatedAt: serverTimestamp(),
      };
      await updateDoc(docRef, payload);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  }

  public async delete(id: string): Promise<void> {
    if (!auth.currentUser) {
      console.warn(`[BaseRepository] Skipping delete for '${this.collectionName}/${id}': No active Firebase user.`);
      return;
    }
    const path = `${this.collectionName}/${id}`;
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  }

  public async listAll(limitCount = 100): Promise<T[]> {
    if (!auth.currentUser) {
      console.warn(`[BaseRepository] Skipping listAll for '${this.collectionName}': No active Firebase user.`);
      return [];
    }
    try {
      const colRef = collection(db, this.collectionName);
      const snap = await getDocs(colRef);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as T);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, this.collectionName);
      return [];
    }
  }
}
