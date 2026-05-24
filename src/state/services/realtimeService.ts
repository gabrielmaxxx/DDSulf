import { useRealtimeStore } from '../realtime/store';

export class RealtimeService {
  private static instance: RealtimeService;
  private activeListeners_Map = new Map<string, () => void>();

  public static getInstance(): RealtimeService {
    if (!RealtimeService.instance) {
      RealtimeService.instance = new RealtimeService();
    }
    return RealtimeService.instance;
  }

  /**
   * Simulates attaching a live callback to a source collection on Firestore.
   * Leverages registerSubscription to coordinate state dashboards.
   */
  public subscribeToCollection(collectionPath: string, onUpdateCallback: (data: any) => void): () => void {
    const store = useRealtimeStore.getState();
    store.registerSubscription(collectionPath);
    console.log(`[RealtimeService] Active Firebase listener bound to path: ${collectionPath}`);

    // Mocking real-time updates intermittently
    let intervalId: any = null;
    if (typeof window !== 'undefined') {
      intervalId = setInterval(() => {
        const isOnline = useRealtimeStore.getState().isOnline;
        if (isOnline) {
          // Send simulated background pulse/activity
          onUpdateCallback({ ping: true, time: new Date().toISOString() });
        }
      }, 10000);
    }

    const unsubscribe = () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      this.activeListeners_Map.delete(collectionPath);
      useRealtimeStore.getState().unregisterSubscription(collectionPath);
      console.log(`[RealtimeService] Unsubscribed listener from: ${collectionPath}`);
    };

    this.activeListeners_Map.set(collectionPath, unsubscribe);
    return unsubscribe;
  }

  /**
   * Clear all active Firestore listeners cleanly
   */
  public disconnectAll(): void {
    console.log(`[RealtimeService] Dismantling ${this.activeListeners_Map.size} active subscriptions...`);
    this.activeListeners_Map.forEach((unsub) => {
      try {
        unsub();
      } catch (e) {
        // ignore
      }
    });
    this.activeListeners_Map.clear();
    useRealtimeStore.getState().clearAllSubscriptions();
  }
}

export const realtimeService = RealtimeService.getInstance();
