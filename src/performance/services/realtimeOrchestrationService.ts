/**
 * DDSulf Realtime Subscription & Stream Orchestration Service
 * Keeps memory channels clean, de-duplicates Firestore references, and throttles rapid mutations.
 */

class RealtimeOrchestrationService {
  private activeSubscriptions = new Map<string, {
    channelId: string;
    listenerName: string;
    subscribedAt: number;
    lastTickMs: number;
    signalsCount: number;
  }>();

  private messageQueue: any[] = [];
  private processingInterval: any = null;

  /**
   * Safe registers a listener, ensuring duplicate subscriptions on identical collections are skipped
   */
  public registerSubscription(channelId: string, listenerName: string): boolean {
    if (this.activeSubscriptions.has(channelId)) {
      const existing = this.activeSubscriptions.get(channelId);
      if (existing) {
        existing.signalsCount++;
      }
      return false; // already registered/re-shared cleanly
    }

    this.activeSubscriptions.set(channelId, {
      channelId,
      listenerName,
      subscribedAt: Date.now(),
      lastTickMs: Date.now(),
      signalsCount: 1
    });

    return true; // fresh subscription mounted
  }

  /**
   * Unregister listener cleanly
   */
  public removeSubscription(channelId: string): boolean {
    return this.activeSubscriptions.delete(channelId);
  }

  /**
   * Smart throttler: receives signals and batches updates to protect rendering cycles from flashing
   */
  public pushMutationSignal(channelId: string, mutationPayload: any, onBatchProcess: (items: any[]) => void) {
    const sub = this.activeSubscriptions.get(channelId);
    if (sub) {
      sub.lastTickMs = Date.now();
      sub.signalsCount++;
    }

    this.messageQueue.push(mutationPayload);

    // If batch logic is idle, bootstrap frame interval (throttle updates to 350ms batches)
    if (!this.processingInterval) {
      this.processingInterval = setTimeout(() => {
        const batch = [...this.messageQueue];
        this.messageQueue = [];
        this.processingInterval = null;
        if (batch.length > 0) {
          onBatchProcess(batch);
        }
      }, 350);
    }
  }

  public getActiveSubscriptions() {
    return Array.from(this.activeSubscriptions.values());
  }

  public clearAll() {
    this.activeSubscriptions.clear();
    if (this.processingInterval) {
      clearTimeout(this.processingInterval);
      this.processingInterval = null;
    }
    this.messageQueue = [];
  }
}

export const realtimeOrchestrationService = new RealtimeOrchestrationService();
export default realtimeOrchestrationService;
