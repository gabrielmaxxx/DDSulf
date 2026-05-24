/**
 * Memoized Slices and Selector Patterns for DDSulf State Stores
 * Optimized to prevent full-store subscription cascades and ensure responsive UI.
 */

// 1. Calculator Selectors
export const selectPricingInputs = (state: import('../calculator/store').CalculatorState) => state.inputs;
export const selectPricingBreakdown = (state: import('../calculator/store').CalculatorState) => state.breakdown;
export const selectChemicalsList = (state: import('../calculator/store').CalculatorState) => state.chemicals;
export const selectSelectedChemicalIds = (state: import('../calculator/store').CalculatorState) => state.selectedChemicalIds;

// 2. Workflow Selectors
export const selectWorkflowSteps = (state: import('../workflow/store').WorkflowState) => state.steps;
export const selectActiveDraft = (state: import('../workflow/store').WorkflowState) => state.activeDraft;
export const selectCurrentStepIndex = (state: import('../workflow/store').WorkflowState) => state.currentStepIndex;
export const selectSavedDrafts = (state: import('../workflow/store').WorkflowState) => state.savedDrafts;

// 3. Financial Selectors
export const selectExpensesList = (state: import('../financial/store').FinancialState) => state.expenses;
export const selectFinancialSummary = (state: import('../financial/store').FinancialState) => ({
  totalOperationalCosts: state.totalOperationalCosts,
  totalConfirmedRevenue: state.totalConfirmedRevenue,
  actualGrossMarginPercent: state.actualGrossMarginPercent,
  netProfit: state.netProfit
});

// 4. Analytics Selectors
export const selectMarginLeaks = (state: import('../analytics/store').AnalyticsState) => state.marginLeaks;
export const selectSeasonalForecasts = (state: import('../analytics/store').AnalyticsState) => state.forecasts;
export const selectSavedSnapshots = (state: import('../analytics/store').AnalyticsState) => state.snapshots;
export const selectAnalyticsKPIs = (state: import('../analytics/store').AnalyticsState) => state.kpis;

// 5. Offline and Realtime Selectors
export const selectSyncQueue = (state: import('../offline/store').OfflineState) => state.syncQueue;
export const selectIsOnline = (state: import('../realtime/store').RealtimeState) => state.isOnline;
export const selectPresentUsers = (state: import('../realtime/store').RealtimeState) => state.presentUsers;
export const selectActiveSubscriptions = (state: import('../realtime/store').RealtimeState) => state.activeSubscriptions;
export const selectIsSyncing = (state: import('../realtime/store').RealtimeState) => state.isSyncing;
