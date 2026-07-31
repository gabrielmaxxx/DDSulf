import { useState, useEffect } from 'react';
import { POP, PestType, EnvironmentType } from '@/types/database';
import { popsService } from '@/services/pops/pops';
import { DEFAULT_EMPRESA_ID } from '@/tenant';

export function usePOPs(empresaId: string = DEFAULT_EMPRESA_ID) {
  const [pops, setPops] = useState<POP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  async function loadPOPs() {
    try {
      setLoading(true);
      const list = await popsService.list(empresaId);
      setPops(list);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPOPs();
  }, [empresaId]);

  const filterByPest = async (pest: PestType) => {
    try {
      setLoading(true);
      const filtered = await popsService.listPOPsByPest(empresaId, pest);
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
      const filtered = await popsService.listPOPsByEnvironment(empresaId, env);
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
