import React, { createContext, useContext, useState, useCallback } from 'react';

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

interface QueryContextType {
  cache: Record<string, CacheItem<any>>;
  getQuery: <T>(key: string) => T | null;
  setQuery: <T>(key: string, data: T) => void;
  invalidateQuery: (key: string) => void;
  invalidateAll: () => void;
}

const QueryContext = createContext<QueryContextType | undefined>(undefined);

const CACHE_STALE_MS = 60000; // 1 minute default cache

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [cache, setCache] = useState<Record<string, CacheItem<any>>>({});

  const getQuery = useCallback(<T,>(key: string): T | null => {
    const item = cache[key];
    if (!item) return null;
    
    // Check if stale
    const isStale = Date.now() - item.timestamp > CACHE_STALE_MS;
    if (isStale) return null;
    
    return item.data as T;
  }, [cache]);

  const setQuery = useCallback(<T,>(key: string, data: T) => {
    setCache((prev) => ({
      ...prev,
      [key]: {
        data,
        timestamp: Date.now(),
      },
    }));
  }, []);

  const invalidateQuery = useCallback((key: string) => {
    setCache((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  }, []);

  const invalidateAll = useCallback(() => {
    setCache({});
  }, []);

  return (
    <QueryContext.Provider value={{ cache, getQuery, setQuery, invalidateQuery, invalidateAll }}>
      {children}
    </QueryContext.Provider>
  );
}

export function useAppQuery() {
  const context = useContext(QueryContext);
  if (!context) {
    throw new Error('useAppQuery must be used within a QueryProvider');
  }
  return context;
}
