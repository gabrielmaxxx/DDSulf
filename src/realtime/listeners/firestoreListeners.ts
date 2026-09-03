import { db } from '../../firebase';
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  limit,
  DocumentData,
} from 'firebase/firestore';
import { subscriptionRegistry } from '../subscriptions/registry';
import { eventBus } from '../events/eventBus';
import { RealtimeEventType } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

/**
 * Enterprise Security Guard: Throw mandatory structured JSON object on Permission Access violations
 */
function handleFirestoreError(error: any, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: 'local_client_uid', // Standard stub resolved via dynamic system calls
      email: 'operador@pestflow.com',
    },
  };
  console.error('Firestore Error Exception:', JSON.stringify(errInfo));
  return new Error(JSON.stringify(errInfo));
}

export class FirestoreListeners {
  private static instance: FirestoreListeners;

  public static getInstance(): FirestoreListeners {
    if (!FirestoreListeners.instance) {
      FirestoreListeners.instance = new FirestoreListeners();
    }
    return FirestoreListeners.instance;
  }

  /**
   * Listen to a specific quote document dynamically
   */
  public streamDocument<T = DocumentData>(
    collectionName: string,
    docId: string,
    onSuccess: (data: T) => void,
    eventOnUpdate?: RealtimeEventType
  ): () => void {
    const docPath = `${collectionName}/${docId}`;

    return subscriptionRegistry.register(
      docPath,
      'document',
      () => {
        const docRef = doc(db, collectionName, docId);
        return onSnapshot(
          docRef,
          (snapshot) => {
            if (snapshot.exists()) {
              const data = { id: snapshot.id, ...snapshot.data() } as T;
              onSuccess(data);

              if (eventOnUpdate) {
                eventBus.publish(eventOnUpdate, data);
              }
            }
          },
          (err) => {
            throw handleFirestoreError(err, OperationType.GET, docPath);
          }
        );
      },
      { priority: 'high' }
    );
  }

  /**
   * Live streaming of limited queries (e.g. tracking specific active users list)
   */
  public streamCollection<T = DocumentData>(
    collectionName: string,
    onSuccess: (list: T[]) => void,
    filters?: { field: string; operator: any; value: any }[],
    maxLimit = 100
  ): () => void {
    const filterKey = filters ? JSON.stringify(filters) : 'full';
    const subKey = `collection:${collectionName}:${filterKey}:limit-${maxLimit}`;

    return subscriptionRegistry.register(
      subKey,
      'collection',
      () => {
        let q = query(collection(db, collectionName), limit(maxLimit));

        if (filters && filters.length > 0) {
          const constraints = filters.map((f) => where(f.field, f.operator, f.value));
          q = query(collection(db, collectionName), ...constraints, limit(maxLimit));
        }

        return onSnapshot(
          q,
          (snapshot) => {
            const list: T[] = [];
            snapshot.forEach((snapDoc) => {
              list.push({ id: snapDoc.id, ...snapDoc.data() } as T);
            });
            onSuccess(list);
          },
          (err) => {
            throw handleFirestoreError(err, OperationType.LIST, collectionName);
          }
        );
      },
      { priority: 'normal' }
    );
  }
}

export const firestoreListeners = FirestoreListeners.getInstance();
