import { useState, useEffect, useMemo } from 'react';
import { firestoreListeners } from '../listeners/firestoreListeners';
import { eventBus } from '../events/eventBus';
import { liveCalculationsEngine, CalculationInput } from '../operational/liveCalculations';
import { liveFinancialEngine, ConsolidatedBalances, FinancialMetric } from '../financial/liveFinancial';
import { liveAnalyticsTracker, LiveKPIState } from '../analytics/liveAnalytics';
import { liveWorkflowsManager, LiveDraft } from '../workflows/liveWorkflows';
import { syncEngine } from '../synchronization/syncEngine';
import { offlineQueue } from '../offline/offlineQueue';
import { RealtimeEventType } from '../types';

/**
 * 1. useRealtimeSubscription
 * Streams dynamic Firestore documents directly while managing proper reference unbinds
 */
export function useRealtimeSubscription<T = any>(
  collectionName: string,
  docId: string | null
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!docId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = firestoreListeners.streamDocument<T>(
      collectionName,
      docId,
      (payload) => {
        setData(payload);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [collectionName, docId]);

  return { data, loading };
}

/**
 * 2. useLiveAnalytics
 * Connects directly to our analytical KPI streams
 */
export function useLiveAnalytics() {
  const [kpis, setKpis] = useState<LiveKPIState>(() => liveAnalyticsTracker.getKpis());
  const [alerts, setAlerts] = useState<string[]>(() => liveAnalyticsTracker.getAlertLogs());

  useEffect(() => {
    // Start tracking if not active
    liveAnalyticsTracker.startTracking();

    const unsubscribe = eventBus.subscribe('analytics:kpi_pulsed', (evt) => {
      setKpis({ ...evt.payload });
      setAlerts(() => liveAnalyticsTracker.getAlertLogs());
    });

    return () => unsubscribe();
  }, []);

  return { kpis, alerts };
}

/**
 * 3. useRealtimePricing
 * Recalculates quote simulations instantly using local mathematical matrices
 */
export function useRealtimePricing(input: CalculationInput) {
  return useMemo(() => {
    return liveCalculationsEngine.compute(input);
  }, [
    input.areaSize,
    input.pestType,
    input.complexity,
    input.displacementDistance,
    input.appliedMarginPercent,
  ]);
}

/**
 * 4. useRealtimeFinancials
 * Streams active company transactions and dynamic balances
 */
export function useRealtimeFinancials() {
  const [balances, setBalances] = useState<ConsolidatedBalances>(() => liveFinancialEngine.getBalances());
  const [transactions, setTransactions] = useState<FinancialMetric[]>(() => liveFinancialEngine.getTransactions());

  useEffect(() => {
    const unsub = eventBus.subscribe('financial:cost_updated', (evt) => {
      setTransactions(() => liveFinancialEngine.getTransactions());
      setBalances({ ...evt.payload.balances });
    });

    return () => unsub();
  }, []);

  const addMetric = (metric: Omit<FinancialMetric, 'id' | 'timestamp'>) => {
    return liveFinancialEngine.addMetric(metric);
  };

  return { balances, transactions, addMetric };
}

/**
 * 5. useOperationalEvents
 * Exposes a callback pipeline to listen or trigger system-wide operational notes
 */
export function useOperationalEvents<P = any>(
  eventType: RealtimeEventType,
  onEvent?: (payload: P) => void
) {
  useEffect(() => {
    if (!onEvent) return;
    const unsubscribe = eventBus.subscribe(eventType, (evt) => {
      onEvent(evt.payload);
    });
    return () => unsubscribe();
  }, [eventType, onEvent]);

  const triggerEvent = (payload: P) => {
    return eventBus.publish(eventType, payload);
  };

  return { triggerEvent };
}

/**
 * 6. useSyncStatus
 * Monitors browser online states and tracks local unsynced backlogs
 */
export function useSyncStatus() {
  const [health, setHealth] = useState(() => syncEngine.getHealth());
  const [backlogCount, setBacklogCount] = useState(0);

  const updateStats = async () => {
    const queue = await offlineQueue.getQueue();
    setBacklogCount(queue.length);
  };

  useEffect(() => {
    // Make sure sync engine events are globally active
    syncEngine.initialize();

    updateStats();

    const unsubNetwork = eventBus.subscribe('sync:network_changed', () => {
      setHealth(syncEngine.getHealth());
      updateStats();
    });

    const unsubReconciled = eventBus.subscribe('sync:backlog_reconciled', () => {
      updateStats();
    });

    const unsubError = eventBus.subscribe('sync:error_encountered', () => {
      updateStats();
    });

    // Check periodically
    const interval = setInterval(updateStats, 5000);

    return () => {
      unsubNetwork();
      unsubReconciled();
      unsubError();
      clearInterval(interval);
    };
  }, []);

  const forceSync = () => {
    syncEngine.processBacklog();
  };

  return { health, backlogCount, forceSync };
}

/**
 * 7. useLiveWorkflow
 * Wizard automation hook to save and synch client proposals under creation
 */
export function useLiveWorkflow(activeDraftId?: string) {
  const [draft, setDraft] = useState<LiveDraft | null>(() =>
    activeDraftId ? liveWorkflowsManager.getDraft(activeDraftId) || null : null
  );

  useEffect(() => {
    if (!activeDraftId) return;

    const unsub = eventBus.subscribe('workflow:draft_updated', (evt) => {
      if (evt.payload.id === activeDraftId) {
        setDraft({ ...evt.payload });
      }
    });

    return () => unsub();
  }, [activeDraftId]);

  const createDraft = (clientName: string) => {
    const nextDraft = liveWorkflowsManager.createDraft(clientName);
    setDraft(nextDraft);
    return nextDraft;
  };

  const updateDraft = (updates: Partial<LiveDraft>) => {
    if (!draft) return;
    const updated = liveWorkflowsManager.updateDraft(draft.id, updates);
    if (updated) {
      setDraft(updated);
    }
  };

  const completeWorkflow = () => {
    if (!draft) return;
    liveWorkflowsManager.completeWorkflow(draft.id);
    setDraft(null);
  };

  return {
    draft,
    createDraft,
    updateDraft,
    completeWorkflow,
    activeDrafts: liveWorkflowsManager.getActiveDraftsList(),
  };
}

/**
 * 8. useRealtimeAlerts
 * Aggregates and alerts critical risk incidents like margin leakage
 */
export function useRealtimeAlerts() {
  const [alerts, setAlerts] = useState<{ id: string; msg: string; type: string }[]>([]);

  useEffect(() => {
    const unsubMargin = eventBus.subscribe('financial:margin_leakage', (evt) => {
      setAlerts((prev) => [
        { id: evt.payload.id || String(Date.now()), msg: evt.payload.message, type: 'critical' },
        ...prev,
      ]);
    });

    return () => {
      unsubMargin();
    };
  }, []);

  const clearAlerts = () => setAlerts([]);

  return { alerts, clearAlerts };
}
