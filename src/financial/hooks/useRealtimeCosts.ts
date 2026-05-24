import { useState, useMemo } from 'react';
import { useFinancialComposition, UseFinancialCompositionParams } from './useFinancialComposition';
import { FullFinancialComposition } from '../composition/compositionEngine';

export function useRealtimeCosts(initialParams: UseFinancialCompositionParams) {
  const [params, setParams] = useState<UseFinancialCompositionParams>(initialParams);

  // Keeps key-based caches of recent parameters to skip repetitive heavy parsing matching standard cache principles
  const cacheKey = useMemo(() => {
    return [
      params.pestType,
      params.environmentType,
      params.infestationLevel,
      params.complexity,
      params.areaSize,
      params.displacement,
      params.technicians,
      params.targetPriceSelected,
      params.selectedProducts.length
    ].join('|');
  }, [params]);

  const output: FullFinancialComposition = useFinancialComposition(params);

  // Storing intermediate evaluations in state hook memory
  const memoryMap = useMemo(() => {
    const registry = new Map<string, FullFinancialComposition>();
    registry.set(cacheKey, output);
    return registry;
  }, [cacheKey, output]);

  const liveCalculationOutput = useMemo(() => {
    return memoryMap.get(cacheKey) || output;
  }, [cacheKey, output, memoryMap]);

  return {
    params,
    setParams,
    liveCalculationOutput,
    cacheKey
  };
}
