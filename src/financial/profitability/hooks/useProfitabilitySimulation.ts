import { useMemo } from 'react';
import { simulateFinancialScenarios } from '../simulations/simulationEngine';
import { ProfitabilitySimulationScenario } from '../types';

export interface UseProfitabilitySimulationParams {
  baseDirectCost: number;
  baseIndirectOverhead: number;
  taxRate?: number;
  targetMarginPercent?: number;
}

export function useProfitabilitySimulation(params: UseProfitabilitySimulationParams) {
  // Define default scenarios for fast UI simulations
  const defaultScenariosRegistry = useMemo(() => {
    return [
      {
        id: 'scen_opt_labor',
        label: 'Aceleração de Campo (Roteirização Técnica)',
        manHoursAdjustment: 0.82 // 18% technical dispatch speedup
      },
      {
        id: 'scen_logistics_reduction',
        label: 'Consolidação de Rota Geográfica',
        manHoursAdjustment: 1.0,
        displacementAdjustment: -20 // reduce 20 Km
      },
      {
        id: 'scen_high_profile_client',
        label: 'Margem Premium para Indústrias',
        manHoursAdjustment: 1.0,
        marginTargetAdjustment: 10 // increase margin by 10%
      },
      {
        id: 'scen_annual_discount',
        label: 'Desconto de Fidelidade de Recorrência',
        manHoursAdjustment: 0.9,
        marginTargetAdjustment: -5,
        recurrenceDiscountOverride: 50 // discrete pricing discount
      }
    ];
  }, []);

  const simulatedOutcomes: ProfitabilitySimulationScenario[] = useMemo(() => {
    return simulateFinancialScenarios(
      params.baseDirectCost,
      params.baseIndirectOverhead,
      params.taxRate !== undefined ? params.taxRate : 0.09,
      params.targetMarginPercent !== undefined ? params.targetMarginPercent : 55.0,
      defaultScenariosRegistry
    );
  }, [params, defaultScenariosRegistry]);

  return {
    simulatedOutcomes
  };
}
