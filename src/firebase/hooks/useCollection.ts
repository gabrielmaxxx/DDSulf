import { useState, useEffect } from 'react';
import { subscribeCollection } from '../firestore';
import { QueryOptions } from '../types';
import { useAuth } from '@/auth/hooks/useAuth';

/**
 * Stateful hook to subscribe to a Firestore collection in realtime
 * @param path Firestore collection path (e.g. 'quotes', 'products')
 * @param options optional QueryOptions (filters, sorting, ordering)
 * @param passedEmpresaId optional explicit tenant ID override
 */
export function useCollection<T>(path: string, options?: QueryOptions, passedEmpresaId?: string) {
  const { empresaId: authEmpresaId } = useAuth();
  const activeEmpresaId = passedEmpresaId || authEmpresaId || '';

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Stable stringification of options for the hook dependency array
  const filterKey = options ? JSON.stringify({
    filters: options.filters?.map(f => ({ ...f, value: String(f.value) })),
    orderByField: options.orderByField,
    orderDirection: options.orderDirection,
    limitCount: options.limitCount
  }) : '';

  useEffect(() => {
    if (!activeEmpresaId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeCollection<T>(
      path,
      options,
      (items) => {
        setData(items);
        setLoading(false);
      },
      (err) => {
        const formattedErr = err instanceof Error ? err : new Error(String(err));
        setError(formattedErr);
        setLoading(false);
      },
      activeEmpresaId
    );

    return () => {
      unsubscribe();
    };
  }, [path, filterKey, activeEmpresaId]);

  return { data, loading, error };
}

export default useCollection;
