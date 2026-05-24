/**
 * Enterprise Snapshot Real-time De-duplicated Stream Listener coordination
 */

import { onSnapshot, collection, query, where, doc, limit } from 'firebase/firestore';
import { db } from '../config';
import { handleFirestoreError } from '../utils/errorHandler';
import { OperationType } from '../types';

/**
 * Attaches a real-time stream to any specific document id
 */
export function listenToDocument<T>(
  collectionName: string,
  docId: string,
  onUpdate: (data: T | null) => void
): () => void {
  const path = `${collectionName}/${docId}`;
  const docRef = doc(db, collectionName, docId);
  
  const unsubscribe = onSnapshot(
    docRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        onUpdate(null);
        return;
      }
      onUpdate({ id: snapshot.id, ...snapshot.data() } as T);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, path);
    }
  );

  return unsubscribe;
}

/**
 * Attaches real-time listener to collection with specific filters
 */
export function listenToCollection<T>(
  collectionName: string,
  onUpdate: (data: T[]) => void,
  filters?: { field: string; operator: any; value: any }[],
  maxLimit = 100
): () => void {
  const colRef = collection(db, collectionName);
  let q = query(colRef, limit(maxLimit));

  if (filters && filters.length > 0) {
    const constraints = filters.map(f => where(f.field, f.operator, f.value));
    q = query(colRef, ...constraints, limit(maxLimit));
  }

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as T);
      onUpdate(docs);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, collectionName);
    }
  );

  return unsubscribe;
}
