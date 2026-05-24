import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config';
import { OperationType } from '../types';
import { handleFirestoreError } from '../utils/errorHandler';

/**
 * Stateful hook to subscribe to a single document change in Firestore
 * @param path Collection path (e.g., 'users')
 * @param id Document ID
 */
export function useDocument<T>(path: string, id: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const docRef = doc(db, path, id);

    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        setData({ id: snap.id, ...snap.data() } as any);
      } else {
        setData(null);
      }
      setLoading(false);
    }, (err) => {
      const formattedErr = err instanceof Error ? err : new Error(String(err));
      setError(formattedErr);
      setLoading(false);
      
      console.error(`[useDocument Hook] Event listener error at ${path}/${id}:`, formattedErr.message);
    });

    return () => unsubscribe();
  }, [path, id]);

  return { data, loading, error };
}
export default useDocument;
