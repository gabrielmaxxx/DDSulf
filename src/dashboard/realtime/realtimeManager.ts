import { RealtimeAnalyticsService } from '../services/realtimeAnalytics';
import { useRealtimeStore } from '@/store/useRealtimeStore';
import { OperationalSnapshot } from '../types';

export class RealtimeManager {
  private static instance: RealtimeManager | null = null;
  private unsubscribers: Array<() => void> = [];

  private constructor() {}

  public static getInstance(): RealtimeManager {
    if (!RealtimeManager.instance) {
      RealtimeManager.instance = new RealtimeManager();
    }
    return RealtimeManager.instance;
  }

  /**
   * Spawns all operational subscriptions and updates standard central Zustand engine state indicators
   */
  public startSubscriptions(
    onSnapshotUpdate: (snapshot: OperationalSnapshot) => void,
    onPendingSyncCount?: (count: number) => void
  ) {
    this.stopSubscriptions();
    
    const store = useRealtimeStore.getState();
    store.setSyncing(true);

    // 1. Snapshot pipeline
    const unsubSnap = RealtimeAnalyticsService.subscribeToOperationalSnapshot((snap) => {
      onSnapshotUpdate(snap);
      store.incrementActiveSubscriptions();
      store.setSyncing(false);
    });
    this.unsubscribers.push(unsubSnap);

    // 2. Monitoring network event loops
    if (typeof window !== 'undefined') {
      const handleOnline = () => store.setOnlineStatus(true);
      const handleOffline = () => store.setOnlineStatus(false);
      
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      this.unsubscribers.push(() => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      });
    }
  }

  /**
   * Detaches and deallocates active stream sockets to optimize battery and browser runtime performance
   */
  public stopSubscriptions() {
    const store = useRealtimeStore.getState();
    this.unsubscribers.forEach(unsub => {
      try {
        unsub();
        store.decrementActiveSubscriptions();
      } catch (e) {
        // Safe tear down
      }
    });
    this.unsubscribers = [];
  }
}

export default RealtimeManager;
