import { syncEngine } from '../synchronization/syncEngine';
import { subscriptionRegistry } from '../subscriptions/registry';
import { firestoreListeners } from '../listeners/firestoreListeners';
import { eventBus } from '../events/eventBus';
import { liveCalculationsEngine } from '../operational/liveCalculations';
import { liveWorkflowsManager } from '../workflows/liveWorkflows';
import { liveFinancialEngine } from '../financial/liveFinancial';
import { liveAnalyticsTracker } from '../analytics/liveAnalytics';

export class RealtimeService {
  private static instance: RealtimeService;
  private initialized = false;

  public static getInstance(): RealtimeService {
    if (!RealtimeService.instance) {
      RealtimeService.instance = new RealtimeService();
    }
    return RealtimeService.instance;
  }

  /**
   * Safe bootstrapper to bind window status, visibilities, and analytical triggers
   */
  public initialize(): void {
    if (this.initialized) return;

    // 1. Initialise synchronized queues and network latencies
    syncEngine.initialize();

    // 2. Start streaming statistical parameters
    liveAnalyticsTracker.startTracking();

    this.initialized = true;

    if (process.env.NODE_ENV !== 'production') {
      console.log('%c🌟 [RealtimeService] DDSulf Live operational infrastructure initialized.', 'color: #10b981; font-weight: bold;');
    }
  }

  // Facades for streamlined service imports
  public get sync() {
    return syncEngine;
  }

  public get registry() {
    return subscriptionRegistry;
  }

  public get listeners() {
    return firestoreListeners;
  }

  public get bus() {
    return eventBus;
  }

  public get calculator() {
    return liveCalculationsEngine;
  }

  public get workflow() {
    return liveWorkflowsManager;
  }

  public get financial() {
    return liveFinancialEngine;
  }

  public get analytics() {
    return liveAnalyticsTracker;
  }

  /**
   * Teardown connection interfaces
   */
  public shutdown(): void {
    subscriptionRegistry.disconnectAll();
    eventBus.destroy();
    this.initialized = false;
  }
}

export const realtimeService = RealtimeService.getInstance();
export default realtimeService;
