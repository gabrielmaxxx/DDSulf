import { useState, useCallback } from 'react';

/**
 * Custom state tracker hook for executing any Firestore async procedure with loading/error feedback
 */
export function useFirestore() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async <T>(asyncFunc: () => Promise<T>): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFunc();
      return result;
    } catch (err: any) {
      const formattedError = err instanceof Error ? err : new Error(String(err));
      setError(formattedError);
      console.error('[DDSulf hook:useFirestore] Mutation/Query execution failed:', formattedError);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, execute };
}
export default useFirestore;
