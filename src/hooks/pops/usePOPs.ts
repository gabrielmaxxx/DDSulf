import { useState, useEffect } from 'react';
import { POP, PestType, EnvironmentType } from '@/types/database';
import { popsService } from '@/services/pops/pops';

export function usePOPs() {
  const [pops, setPops] = useState<POP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  async function loadPOPs() {
    try {
      setLoading(true);
      const list = await popsService.list();
      setPops(list);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPOPs();
  }, []);

  const filterByPest = async (pest: PestType) => {
    try {
      setLoading(true);
      const filtered = await popsService.listPOPsByPest(pest);
      setPops(filtered);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  const filterByEnvironment = async (env: EnvironmentType) => {
    try {
      setLoading(true);
      const filtered = await popsService.listPOPsByEnvironment(env);
      setPops(filtered);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  return {
    pops,
    isLoading: loading,
    error,
    refresh: loadPOPs,
    filterByPest,
    filterByEnvironment
  };
}

export default usePOPs;
