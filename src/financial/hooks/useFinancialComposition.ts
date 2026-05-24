import { useMemo } from 'react';
import { PestType, EnvironmentType, InfestationLevel, OperationalComplexity } from '@/types/database';
import { useOperationalCosts } from './useOperationalCosts';
import { calculateOperationalFinancialComposition, FullFinancialComposition } from '../composition/compositionEngine';

export interface UseFinancialCompositionParams {
  areaSize: number;
  displacement: number;
  technicians: number;
  pestType: PestType;
  environmentType: EnvironmentType;
  infestationLevel: InfestationLevel;
  complexity: OperationalComplexity;
  targetPriceSelected: number;
  selectedProducts: Array<{
    id: string;
    name: string;
    unitCost: number;
    dosagePerM2: number;
    unitLabel: string;
  }>;
}

export function useFinancialComposition(params: UseFinancialCompositionParams): FullFinancialComposition {
  const { fixedCosts, variableCosts, allocationSettings } = useOperationalCosts();

  return useMemo(() => {
    return calculateOperationalFinancialComposition({
      areaSize: params.areaSize,
      displacement: params.displacement,
      technicians: params.technicians,
      pestType: params.pestType,
      environmentType: params.environmentType,
      infestationLevel: params.infestationLevel,
      complexity: params.complexity,
      targetPriceSelected: params.targetPriceSelected,
      selectedProducts: params.selectedProducts,
      fixedCosts,
      variableCosts,
      allocationSettings
    });
  }, [
    params,
    fixedCosts,
    variableCosts,
    allocationSettings
  ]);
}
