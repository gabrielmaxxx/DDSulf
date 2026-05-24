import { create } from 'zustand';
import { loggerMiddleware } from '../middleware/logger';
import { SeasonalTrend, SecurityMarginLeak, CalculatorInputs, PricingBreakdown } from '../types';

export interface SavedSnapshot {
  id: string;
  timestamp: string;
  inputs: CalculatorInputs;
  breakdown: PricingBreakdown;
  label: string;
}

export interface AnalyticsState {
  forecasts: SeasonalTrend[];
  marginLeaks: SecurityMarginLeak[];
  snapshots: SavedSnapshot[];
  kpis: {
    conversionRatePercent: number;
    avgQuoteDraftTimeSeconds: number;
    highestPerformingPestType: string;
    totalAuditedQuotesCount: number;
  };

  // Actions
  addHistoricalSnapshot: (inputs: CalculatorInputs, breakdown: PricingBreakdown, label: string) => void;
  deleteSnapshot: (id: string) => void;
  detectMarginLeaks: (inputs: CalculatorInputs, breakdown: PricingBreakdown, docId: string) => void;
  resolveLeak: (id: string) => void;
  recalculateSchedules: () => void;
  setKPIs: (kpis: Partial<AnalyticsState['kpis']>) => void;
}

const defaultTrends: SeasonalTrend[] = [
  { periodLabel: 'Maio (Corrente)', seasonalityFactor: 1.15, growthTrendPercent: 8.5, predictedRevenue: 34000, predictedCost: 11000, avgExpectedMargin: 67 },
  { periodLabel: 'Junho', seasonalityFactor: 1.35, growthTrendPercent: 12.0, predictedRevenue: 48000, predictedCost: 13500, avgExpectedMargin: 71 },
  { periodLabel: 'Julho', seasonalityFactor: 0.90, growthTrendPercent: -4.0, predictedRevenue: 28000, predictedCost: 9800, avgExpectedMargin: 65 },
];

const defaultLeaks: SecurityMarginLeak[] = [
  {
    id: 'leak_01',
    quoteId: 'q_101',
    leakType: 'underpriced_labor',
    criticality: 'medium',
    impactAmount: 180.00,
    confidence: 0.88,
    evidenceMessage: 'Complexidade "Alta" requer 2 técnicos mas orçamento usou base para 1 técnico.',
    resolved: false
  },
  {
    id: 'leak_02',
    quoteId: 'q_105',
    leakType: 'over_dosage',
    criticality: 'high',
    impactAmount: 320.50,
    confidence: 0.95,
    evidenceMessage: 'Dosagem de Fipronil (3g/m²) excede teto POPS de 2g/m² em ambiente residencial.',
    resolved: false
  }
];

export const useAnalyticsStore = create<AnalyticsState>()(
  loggerMiddleware((set, get) => ({
    forecasts: defaultTrends,
    marginLeaks: defaultLeaks,
    snapshots: [],
    kpis: {
      conversionRatePercent: 82,
      avgQuoteDraftTimeSeconds: 42,
      highestPerformingPestType: 'Cupins',
      totalAuditedQuotesCount: 14
    },

    addHistoricalSnapshot: (inputs, breakdown, label) => {
      const { snapshots } = get();
      const newSnapshot: SavedSnapshot = {
        id: `snap_${Math.random().toString(36).substring(2, 9)}`,
        timestamp: new Date().toISOString(),
        inputs: JSON.parse(JSON.stringify(inputs)),
        breakdown: JSON.parse(JSON.stringify(breakdown)),
        label
      };
      set({ snapshots: [newSnapshot, ...snapshots] });
    },

    deleteSnapshot: (id) => {
      set((state) => ({
        snapshots: state.snapshots.filter(s => s.id !== id)
      }));
    },

    detectMarginLeaks: (inputs, breakdown, docId) => {
      const { marginLeaks } = get();
      const detected: SecurityMarginLeak[] = [];

      // Rules logic 1: Underpriced labor
      if (inputs.complexity === 'Crítica' && breakdown.laborCost < 200) {
        detected.push({
          id: `leak_${Math.random().toString(36).substring(2, 7)}`,
          quoteId: docId,
          leakType: 'underpriced_labor',
          criticality: 'high',
          impactAmount: 250,
          confidence: 0.9,
          evidenceMessage: `Alerta: Proposta de alta complexidade (${inputs.complexity}) com taxa técnica barata (R$ ${breakdown.laborCost.toFixed(2)}).`,
          resolved: false
        });
      }

      // Rules logic 2: low margin
      if (breakdown.appliedMarginPercent < 55) {
        detected.push({
          id: `leak_${Math.random().toString(36).substring(2, 7)}`,
          quoteId: docId,
          leakType: 'low_margin_approved',
          criticality: 'critical',
          impactAmount: breakdown.suggestedPrice * 0.15,
          confidence: 0.98,
          evidenceMessage: `Alerta: Margem aplicada (${breakdown.appliedMarginPercent}%) está abaixo do teto de segurança DDSulf (55%).`,
          resolved: false
        });
      }

      // Rules logic 3: Distance calculation anomaly
      if (inputs.displacementDistance > 100 && breakdown.displacementCost < 100) {
        detected.push({
          id: `leak_${Math.random().toString(36).substring(2, 7)}`,
          quoteId: docId,
          leakType: 'distance_underestimation',
          criticality: 'medium',
          impactAmount: inputs.displacementDistance * 4.5 * 2 - breakdown.displacementCost,
          confidence: 0.85,
          evidenceMessage: `Alerta: Distância de ida e volta incompatível com valor cobrado.`,
          resolved: false
        });
      }

      if (detected.length > 0) {
        set({ marginLeaks: [...detected, ...marginLeaks] });
      }
    },

    resolveLeak: (id) => {
      set((state) => ({
        marginLeaks: state.marginLeaks.map((l) =>
          l.id === id ? { ...l, resolved: true } : l
        )
      }));
    },

    recalculateSchedules: () => {
      // Dynamic operational simulation updates
      const { forecasts } = get();
      const updated = forecasts.map(f => {
        const randomness = 0.95 + Math.random() * 0.1; // +/- 5% variation
        return {
          ...f,
          predictedRevenue: Math.round(f.predictedRevenue * randomness),
          predictedCost: Math.round(f.predictedCost * (randomness * 1.02))
        };
      });
      set({ forecasts: updated });
    },

    setKPIs: (updatedKPIs) => set((state) => ({
      kpis: { ...state.kpis, ...updatedKPIs }
    }))
  }))
);
