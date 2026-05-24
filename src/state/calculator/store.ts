import { create } from 'zustand';
import { loggerMiddleware } from '../middleware/logger';
import { CalculatorInputs, PricingBreakdown, ChemicalItem } from '../types';

export interface CalculatorState {
  inputs: CalculatorInputs;
  chemicals: ChemicalItem[];
  breakdown: PricingBreakdown;
  selectedChemicalIds: string[];
  laborRatePerDay: number; // Technician base cost/day (e.g. R$ 150)
  displacementRatePerKm: number; // Diesel/Travel cost (e.g. R$ 4.50)
  
  // Actions
  setInputs: (inputs: Partial<CalculatorInputs>) => void;
  updateLaborRates: (rates: { laborRate?: number; displacementRate?: number }) => void;
  selectChemicals: (ids: string[]) => void;
  recomputePricingBreakdown: () => void;
  runSimulation: (param: { alternativeMargin?: number; complexityMultiplier?: number }) => PricingBreakdown;
  resetCalculator: () => void;
  setChemicalsStockList: (chemicals: ChemicalItem[]) => void;
}

const initialInputs: CalculatorInputs = {
  clientName: '',
  pestType: 'Baratas',
  environmentType: 'Residencial',
  areaSize: 100,
  complexity: 'Média',
  displacementDistance: 20
};

const defaultChemicals: ChemicalItem[] = [
  { id: '1', name: 'Fipronil Pro-X', dosagePerM2: 2, unitCost: 1.5, dilutionRatio: 0.1, stockLevel: 5000, recommendedPests: ['Baratas', 'Cupins'] },
  { id: '2', name: 'Deltametrina SC25', dosagePerM2: 3, unitCost: 0.8, dilutionRatio: 0.05, stockLevel: 8000, recommendedPests: ['Baratas', 'Formigas'] },
  { id: '3', name: 'Bromadiolona Isolar', dosagePerM2: 0.5, unitCost: 4.2, dilutionRatio: 1, stockLevel: 2000, recommendedPests: ['Ratos'] },
];

const initialBreakdown: PricingBreakdown = {
  rawChemicalsCost: 0,
  displacementCost: 0,
  laborCost: 0,
  basePrice: 0,
  appliedMarginPercent: 65,
  suggestedPrice: 0,
  finalPrice: 0,
  taxAmount: 0,
  riskBuffer: 0
};

export const useCalculatorStore = create<CalculatorState>()(
  loggerMiddleware((set, get) => ({
    inputs: initialInputs,
    chemicals: defaultChemicals,
    breakdown: initialBreakdown,
    selectedChemicalIds: ['1'],
    laborRatePerDay: 180,
    displacementRatePerKm: 4.5,

    setInputs: (newInputs) => {
      set((state) => ({
        inputs: { ...state.inputs, ...newInputs }
      }));
      get().recomputePricingBreakdown();
    },

    updateLaborRates: ({ laborRate, displacementRate }) => {
      set((state) => ({
        laborRatePerDay: laborRate !== undefined ? laborRate : state.laborRatePerDay,
        displacementRatePerKm: displacementRate !== undefined ? displacementRate : state.displacementRatePerKm
      }));
      get().recomputePricingBreakdown();
    },

    selectChemicals: (ids) => {
      set({ selectedChemicalIds: ids });
      get().recomputePricingBreakdown();
    },

    recomputePricingBreakdown: () => {
      const { inputs, chemicals, selectedChemicalIds, laborRatePerDay, displacementRatePerKm } = get();
      
      // Calculate chemicals costs
      let rawChemicalsCost = 0;
      selectedChemicalIds.forEach(id => {
        const item = chemicals.find(c => c.id === id);
        if (item) {
          rawChemicalsCost += inputs.areaSize * item.dosagePerM2 * item.unitCost;
        }
      });

      // Calculate travel costs (displacement)
      const displacementCost = inputs.displacementDistance * 2 * displacementRatePerKm;

      // Labor costs based on size and complexity
      let techniciansNeeded = 1;
      let hoursNeeded = 2;
      
      if (inputs.areaSize > 500) techniciansNeeded = 3;
      else if (inputs.areaSize > 250) techniciansNeeded = 2;

      if (inputs.complexity === 'Alta') hoursNeeded = 5;
      else if (inputs.complexity === 'Crítica') hoursNeeded = 8;
      else if (inputs.complexity === 'Média') hoursNeeded = 3.5;

      const laborCost = techniciansNeeded * ((laborRatePerDay / 8) * hoursNeeded);

      // Complexity modifier buffer
      let riskBuffer = 50;
      if (inputs.complexity === 'Alta') riskBuffer = 150;
      if (inputs.complexity === 'Crítica') riskBuffer = 350;

      const basePrice = rawChemicalsCost + displacementCost + laborCost + riskBuffer;
      const appliedMarginPercent = get().breakdown.appliedMarginPercent;
      
      // price calculation: gross margin = (price - costs) / price
      // price = costs / (1 - marginPercent / 100)
      const divider = 1 - (appliedMarginPercent / 100);
      const suggestedPrice = divider > 0 ? basePrice / divider : basePrice * 2.5;
      const taxAmount = suggestedPrice * 0.12; // 12% standard service tax
      const finalPrice = suggestedPrice + taxAmount;

      set({
        breakdown: {
          rawChemicalsCost,
          displacementCost,
          laborCost,
          basePrice,
          appliedMarginPercent,
          suggestedPrice,
          finalPrice,
          taxAmount,
          riskBuffer
        }
      });
    },

    runSimulation: ({ alternativeMargin, complexityMultiplier }) => {
      const { breakdown } = get();
      const margin = alternativeMargin !== undefined ? alternativeMargin : breakdown.appliedMarginPercent;
      const multiplier = complexityMultiplier !== undefined ? complexityMultiplier : 1;
      
      const simulatedBase = breakdown.basePrice * multiplier;
      const divider = 1 - (margin / 100);
      const suggestedPrice = divider > 0 ? simulatedBase / divider : simulatedBase * 2.5;
      const taxAmount = suggestedPrice * 0.12;
      
      return {
        ...breakdown,
        appliedMarginPercent: margin,
        basePrice: simulatedBase,
        suggestedPrice,
        taxAmount,
        finalPrice: suggestedPrice + taxAmount
      };
    },

    setChemicalsStockList: (chemicals) => set({ chemicals }),

    resetCalculator: () => set({
      inputs: initialInputs,
      breakdown: initialBreakdown,
      selectedChemicalIds: ['1']
    })
  }))
);
