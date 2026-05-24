import { useState } from 'react';
import { PricingInputs, PricingBreakdown, PricingSimulation } from '../types';

export function usePricingSimulation() {
  const [scenarios, setScenarios] = useState<PricingSimulation[]>([]);

  const addScenario = (name: string, inputs: PricingInputs, breakdown: PricingBreakdown) => {
    const newScenario: PricingSimulation = {
      id: `sim_${Date.now()}`,
      scenarioName: name,
      inputs: JSON.parse(JSON.stringify(inputs)),
      breakdown: JSON.parse(JSON.stringify(breakdown)),
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    
    setScenarios(prev => {
      // Limit to max 4 comparisons to prevent UI clutter on mobile
      const updated = [newScenario, ...prev];
      return updated.slice(0, 4);
    });
  };

  const removeScenario = (id: string) => {
    setScenarios(prev => prev.filter(s => s.id !== id));
  };

  const clearScenarios = () => {
    setScenarios([]);
  };

  return {
    scenarios,
    addScenario,
    removeScenario,
    clearScenarios,
    hasScenarios: scenarios.length > 0
  };
}
