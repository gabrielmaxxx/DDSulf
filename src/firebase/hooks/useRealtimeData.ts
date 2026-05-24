import { useCollection } from './useCollection';
import { QueryOptions } from '../types';

/**
 * Generic high-level real-time subscription stream hook
 * @param path Collection path to subscribe to (e.g., 'quotes', 'inventory')
 * @param options QueryOptions (filters, ordering, sort direction, limits)
 */
export function useRealtimeData<T>(path: string, options?: QueryOptions) {
  const { data, loading, error } = useCollection<T>(path, options);
  return { 
    data, 
    loading, 
    error,
    isEmpty: !loading && data.length === 0 
  };
}
export default useRealtimeData;
