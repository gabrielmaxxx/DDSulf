/**
 * React state hook for live-cache collection snapshot lists with optimistic operation features
 */

import { useState, useEffect } from 'react';
import { CacheService } from '../cache';
import { OfflineMutationEngine } from '../mutations';

export function useOfflineState<T extends { id?: string }>(
  collectionName: string,
  initialData: T[] = []
) {
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    try {
      const [cached, isStale] = await CacheService.getCollection<T>(collectionName);
      if (cached && cached.length > 0) {
        setData(cached);
      } else {
        setData(initialData);
      }
    } catch {
      setData(initialData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();

    // Setup micro polling list synchronizer to match dynamic background queue shifts
    const interval = setInterval(() => {
      reload();
    }, 4000);

    return () => clearInterval(interval);
  }, [collectionName]);

  const addDoc = async (id: string, payload: T) => {
    const optimistic = await OfflineMutationEngine.createDoc<T>(collectionName, id, payload);
    setData(prev => [optimistic, ...prev.filter(item => item.id !== id)]);
  };

  const updateDoc = async (id: string, payload: Partial<T>) => {
    await OfflineMutationEngine.updateDoc<T>(collectionName, id, payload);
    setData(prev => prev.map(item => item.id === id ? { ...item, ...payload } : item));
  };

  const deleteDoc = async (id: string) => {
    await OfflineMutationEngine.deleteDoc(collectionName, id);
    setData(prev => prev.filter(item => item.id !== id));
  };

  return {
    data,
    loading,
    refresh: reload,
    addDoc,
    updateDoc,
    deleteDoc
  };
}

export default useOfflineState;
