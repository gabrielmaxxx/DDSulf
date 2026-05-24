import { useState, useEffect } from 'react';
import { FixedCostItem, VariableCostItem, CostAllocationSettings } from '../types';
import { DEFAULT_FIXED_COSTS, DEFAULT_ALLOCATION_SETTINGS, calculateTotalAllocatedOverhead } from '../costs/fixedCostsEngine';
import { DEFAULT_VARIABLE_COSTS, getLogisticsRateFromCosts } from '../costs/variableCostsEngine';
import { costEngineService } from '../services/costEngineService';

export function useOperationalCosts() {
  const [fixedCosts, setFixedCosts] = useState<FixedCostItem[]>(DEFAULT_FIXED_COSTS);
  const [variableCosts, setVariableCosts] = useState<VariableCostItem[]>(DEFAULT_VARIABLE_COSTS);
  const [allocationSettings, setAllocationSettings] = useState<CostAllocationSettings>(DEFAULT_ALLOCATION_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [cloudFixed, cloudVariable, cloudAllocation] = await Promise.all([
          costEngineService.loadFixedCosts(),
          costEngineService.loadVariableCosts(),
          costEngineService.loadAllocationSettings()
        ]);

        if (cloudFixed.length > 0) setFixedCosts(cloudFixed);
        if (cloudVariable.length > 0) setVariableCosts(cloudVariable);
        if (cloudAllocation) setAllocationSettings(cloudAllocation);
      } catch (err) {
        console.error('Falha ao carregar dados do cost engine de forma síncrona:', err);
        setError('Erro ao carregar dados do servidor. Usando cache local offline.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const saveFixedCosts = async (newItems: FixedCostItem[]) => {
    try {
      setFixedCosts(newItems);
      // Automatically update the total overhead sum in allocation settings safely
      const updatedOverhead = calculateTotalAllocatedOverhead(newItems);
      const updatedSettings = {
        ...allocationSettings,
        totalMonthlyFixedOverhead: updatedOverhead,
        indirectCostPerServiceBase: Number((updatedOverhead / allocationSettings.monthlyAverageServices).toFixed(2))
      };
      setAllocationSettings(updatedSettings);

      await Promise.all([
        costEngineService.saveFixedCosts(newItems),
        costEngineService.saveAllocationSettings(updatedSettings)
      ]);
    } catch (err) {
      console.error('Erro ao salvar custos fixos:', err);
    }
  };

  const saveVariableCosts = async (newItems: VariableCostItem[]) => {
    try {
      setVariableCosts(newItems);
      await costEngineService.saveVariableCosts(newItems);
    } catch (err) {
      console.error('Erro ao salvar custos variáveis:', err);
    }
  };

  const saveAllocationSettings = async (settings: CostAllocationSettings) => {
    try {
      setAllocationSettings(settings);
      await costEngineService.saveAllocationSettings(settings);
    } catch (err) {
      console.error('Erro ao salvar configurações de rateio:', err);
    }
  };

  const totalFixedOverhead = calculateTotalAllocatedOverhead(fixedCosts);
  const logisticsRateKm = getLogisticsRateFromCosts(variableCosts);

  return {
    fixedCosts,
    variableCosts,
    allocationSettings,
    totalFixedOverhead,
    logisticsRateKm,
    loading,
    error,
    saveFixedCosts,
    saveVariableCosts,
    saveAllocationSettings
  };
}
