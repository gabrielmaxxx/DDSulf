export * from './types';
export * from './margin/marginEngine';
export * from './viability/viabilityEngine';
export * from './decision/decisionEngine';
export * from './simulations/simulationEngine';
export * from './forecasting/forecastingEngine';
export * from './alerts/alertSystem';
export * from './services/marginService';

// Custom State Hooks
export { useMarginIntelligence } from './hooks/useMarginIntelligence';
export { useProfitabilityAnalysis } from './hooks/useProfitabilityAnalysis';
export { useOperationalViability } from './hooks/useOperationalViability';
export { useFinancialRisk } from './hooks/useFinancialRisk';
export { useProfitabilitySimulation } from './hooks/useProfitabilitySimulation';
export { useRealtimeMargin } from './hooks/useRealtimeMargin';

export type { UseProfitabilityAnalysisParams } from './hooks/useProfitabilityAnalysis';
export type { UseOperationalViabilityParams } from './hooks/useOperationalViability';
export type { UseFinancialRiskParams } from './hooks/useFinancialRisk';
export type { UseProfitabilitySimulationParams } from './hooks/useProfitabilitySimulation';
export type { UseRealtimeMarginParams } from './hooks/useRealtimeMargin';
