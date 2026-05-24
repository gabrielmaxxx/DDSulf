import { useAppStore } from '../app/store';
import { useAuthStore } from '../auth/store';
import { useCalculatorStore } from '../calculator/store';
import { useWorkflowStore } from '../workflow/store';
import { useFinancialStore } from '../financial/store';
import { useAnalyticsStore } from '../analytics/store';
import { useRealtimeStore } from '../realtime/store';
import { useOfflineStore } from '../offline/store';
import { persistenceService } from '../persistence/persistenceService';
import { syncService } from '../services/syncService';
import { useMemo } from 'react';

// 1. Hook for tracking presence, connections, and multi-user views
export function useRealtimeState() {
  const isOnline = useRealtimeStore((s) => s.isOnline);
  const isSyncing = useRealtimeStore((s) => s.isSyncing);
  const latencyMs = useRealtimeStore((s) => s.latencyMs);
  const presentUsers = useRealtimeStore((s) => s.presentUsers);
  const activeSubscriptions = useRealtimeStore((s) => s.activeSubscriptions);
  
  const setOnlineStatus = useRealtimeStore((s) => s.setOnlineStatus);
  const updateUserPresenceView = useRealtimeStore((s) => s.updateUserPresenceView);

  return {
    isOnline,
    isSyncing,
    latencyMs,
    presentUsers,
    activeSubscriptions,
    setOnlineStatus,
    updateUserPresenceView
  };
}

// 2. Hook for calculator dimensions, dosage, and pricing variables
export function useOperationalState() {
  const inputs = useCalculatorStore((s) => s.inputs);
  const chemicals = useCalculatorStore((s) => s.chemicals);
  const breakdown = useCalculatorStore((s) => s.breakdown);
  const selectedChemicalIds = useCalculatorStore((s) => s.selectedChemicalIds);
  const laborRatePerDay = useCalculatorStore((s) => s.laborRatePerDay);
  
  const setInputs = useCalculatorStore((s) => s.setInputs);
  const selectChemicals = useCalculatorStore((s) => s.selectChemicals);
  const recomputePricingBreakdown = useCalculatorStore((s) => s.recomputePricingBreakdown);
  const runSimulation = useCalculatorStore((s) => s.runSimulation);
  const resetCalculator = useCalculatorStore((s) => s.resetCalculator);

  return {
    inputs,
    chemicals,
    breakdown,
    selectedChemicalIds,
    laborRatePerDay,
    setInputs,
    selectChemicals,
    recomputePricingBreakdown,
    runSimulation,
    resetCalculator
  };
}

// 3. Hook for multi-step wizarding, active draft autosaving, and undo/redo
export function useWorkflowState() {
  const steps = useWorkflowStore((s) => s.steps);
  const currentStepIndex = useWorkflowStore((s) => s.currentStepIndex);
  const activeDraft = useWorkflowStore((s) => s.activeDraft);
  const savedDrafts = useWorkflowStore((s) => s.savedDrafts);
  
  const nextStep = useWorkflowStore((s) => s.nextStep);
  const prevStep = useWorkflowStore((s) => s.prevStep);
  const jumpToStep = useWorkflowStore((s) => s.jumpToStep);
  const startNewDraft = useWorkflowStore((s) => s.startNewDraft);
  const updateActiveDraft = useWorkflowStore((s) => s.updateActiveDraft);
  const undoDraftChange = useWorkflowStore((s) => s.undoDraftChange);
  const redoDraftChange = useWorkflowStore((s) => s.redoDraftChange);
  const resetWorkflow = useWorkflowStore((s) => s.resetWorkflow);

  return {
    steps,
    currentStepIndex,
    activeDraft,
    savedDrafts,
    nextStep,
    prevStep,
    jumpToStep,
    startNewDraft,
    updateActiveDraft,
    undoDraftChange,
    redoDraftChange,
    resetWorkflow
  };
}

// 4. Hook for financials, total expenses lists, and actual aggregate gross profit
export function useFinancialState() {
  const targetMarginPercent = useFinancialStore((s) => s.targetMarginPercent);
  const expenses = useFinancialStore((s) => s.expenses);
  const revenues = useFinancialStore((s) => s.revenues);
  const totalOperationalCosts = useFinancialStore((s) => s.totalOperationalCosts);
  const totalConfirmedRevenue = useFinancialStore((s) => s.totalConfirmedRevenue);
  const actualGrossMarginPercent = useFinancialStore((s) => s.actualGrossMarginPercent);
  const netProfit = useFinancialStore((s) => s.netProfit);

  const setTargetMargin = useFinancialStore((s) => s.setTargetMargin);
  const addExpense = useFinancialStore((s) => s.addExpense);
  const addRevenue = useFinancialStore((s) => s.addRevenue);
  const calculateFinancialTotals = useFinancialStore((s) => s.calculateFinancialTotals);

  return {
    targetMarginPercent,
    expenses,
    revenues,
    totalOperationalCosts,
    totalConfirmedRevenue,
    actualGrossMarginPercent,
    netProfit,
    setTargetMargin,
    addExpense,
    addRevenue,
    calculateFinancialTotals
  };
}

// 5. Hook for seasonal trend forecasting and security margin leakage audits
export function useAnalyticsState() {
  const forecasts = useAnalyticsStore((s) => s.forecasts);
  const marginLeaks = useAnalyticsStore((s) => s.marginLeaks);
  const snapshots = useAnalyticsStore((s) => s.snapshots);
  const kpis = useAnalyticsStore((s) => s.kpis);

  const addHistoricalSnapshot = useAnalyticsStore((s) => s.addHistoricalSnapshot);
  const deleteSnapshot = useAnalyticsStore((s) => s.deleteSnapshot);
  const detectMarginLeaks = useAnalyticsStore((s) => s.detectMarginLeaks);
  const resolveLeak = useAnalyticsStore((s) => s.resolveLeak);
  const recalculateSchedules = useAnalyticsStore((s) => s.recalculateSchedules);

  return {
    forecasts,
    marginLeaks,
    snapshots,
    kpis,
    addHistoricalSnapshot,
    deleteSnapshot,
    detectMarginLeaks,
    resolveLeak,
    recalculateSchedules
  };
}

// 6. Hook for background queues and force synchronizations
export function useSyncState() {
  const isOnline = useRealtimeStore((s) => s.isOnline);
  const isSyncing = useRealtimeStore((s) => s.isSyncing);
  const queueLength = useOfflineStore((s) => s.syncQueue.length);

  const triggerSync = async () => {
    if (!isOnline) {
      throw new Error('Impossível sincronizar em modo Offline');
    }
    await syncService.processQueue();
  };

  return {
    isOnline,
    isSyncing,
    queueLength,
    triggerSync
  };
}

// 7. Hook for offline queues, failed tasks histories, and queue deletions
export function useOfflineState() {
  const syncQueue = useOfflineStore((s) => s.syncQueue);
  const isProcessingQueue = useOfflineStore((s) => s.isProcessingQueue);
  const failedTasksHistory = useOfflineStore((s) => s.failedTasksHistory);

  const enqueueTask = useOfflineStore((s) => s.enqueueTask);
  const dequeueTask = useOfflineStore((s) => s.dequeueTask);
  const clearSyncQueue = useOfflineStore((s) => s.clearSyncQueue);

  return {
    syncQueue,
    isProcessingQueue,
    failedTasksHistory,
    enqueueTask,
    dequeueTask,
    clearSyncQueue
  };
}

// 8. Hook representing localStorage size summaries and cleanup controllers
export function usePersistedState() {
  const usageStats = useMemo(() => {
    return persistenceService.getStorageReport();
  }, []);

  const clearPersistentCache = () => {
    persistenceService.clearAllDDSulfKeys();
  };

  return {
    usageBytes: usageStats.usedBytes,
    entryCount: usageStats.entryCount,
    clearPersistentCache
  };
}

// Expose Auth details for general context-aware workflows
export function useAuthState() {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const setLoading = useAuthStore((s) => s.setLoading);

  return {
    user,
    isLoading,
    error,
    login,
    logout,
    setLoading
  };
}

// Expose general UI layout statuses
export function useAppPreferences() {
  const theme = useAppStore((s) => s.theme);
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const activeView = useAppStore((s) => s.activeView);
  const metadata = useAppStore((s) => s.metadata);

  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const setActiveView = useAppStore((s) => s.setActiveView);
  const updateMetadata = useAppStore((s) => s.updateMetadata);

  return {
    theme,
    sidebarOpen,
    activeView,
    metadata,
    toggleTheme,
    toggleSidebar,
    setActiveView,
    updateMetadata
  };
}
