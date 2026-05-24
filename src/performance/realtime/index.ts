/**
 * DDSulf Realtime Scalability & Subscription Guard
 */

import { SubscriptionAllocation } from '../types';

class RealtimeOptimizationEngine {
  private subscriptionPool = new Map<string, SubscriptionAllocation>();
  private messageBuffer = new Map<string, any[]>();
  private timeoutsMap = new Map<string, any>();

  /**
   * Deduplicates listeners, ensuring identical channels share a single backing socket cleanly
   */
  public registerLease(
    channelId: string,
    streamName: string,
    tenantId: string,
    isShared: boolean = false
  ): boolean {
    if (this.subscriptionPool.has(channelId)) {
      const lease = this.subscriptionPool.get(channelId);
      if (lease) lease.isShared = true;
      return false; // already shared, bypass starting raw listener again
    }

    this.subscriptionPool.set(channelId, {
      channelId,
      streamName,
      tenantId,
      isShared,
      connectedAt: Date.now(),
      signalsReceived: 0,
      lastSignalAt: Date.now(),
      backpressureBufferLimit: 40
    });

    return true; // fresh lease allowed
  }

  /**
   * Releases lease safely when a subscribing component unmounts
   */
  public releaseLease(channelId: string): boolean {
    const lease = this.subscriptionPool.get(channelId);
    if (!lease) return false;

    // If another component is still sharing the lease, degrade to single user instead of immediate close
    if (lease.isShared) {
      lease.isShared = false;
      return false; // do not close, listener remains active
    }

    this.subscriptionPool.delete(channelId);
    this.messageBuffer.delete(channelId);
    const pendingTimer = this.timeoutsMap.get(channelId);
    if (pendingTimer) {
      clearTimeout(pendingTimer);
      this.timeoutsMap.delete(channelId);
    }
    return true; // fully terminated safely
  }

  /**
   * Backpressure Controller: captures fast-firing socket changes and flushes them in batches
   */
  public handleStreamingSignal(
    channelId: string,
    payload: any,
    onFlushBatch: (batch: any[]) => void,
    throttleDelayMs: number = 250
  ) {
    const lease = this.subscriptionPool.get(channelId);
    if (lease) {
      lease.signalsReceived++;
      lease.lastSignalAt = Date.now();
    }

    let buffer = this.messageBuffer.get(channelId) || [];
    buffer.push(payload);

    // Limit buffer length in extremely high-volume streams to prevent heap blowout
    if (lease && buffer.length > lease.backpressureBufferLimit) {
      buffer.shift(); // Evict oldest signal (FIFO drop strategy under critical load)
    }

    this.messageBuffer.set(channelId, buffer);

    if (!this.timeoutsMap.has(channelId)) {
      const timer = setTimeout(() => {
        const batchToProcess = this.messageBuffer.get(channelId) || [];
        this.messageBuffer.set(channelId, []);
        this.timeoutsMap.delete(channelId);

        if (batchToProcess.length > 0) {
          onFlushBatch(batchToProcess);
        }
      }, throttleDelayMs);

      this.timeoutsMap.set(channelId, timer);
    }
  }

  public getConnectedPool(): SubscriptionAllocation[] {
    return Array.from(this.subscriptionPool.values());
  }

  public collectSystemMetrics() {
    let totalSignals = 0;
    this.subscriptionPool.forEach(l => totalSignals += l.signalsReceived);

    return {
      activeSocketsCount: this.subscriptionPool.size,
      accumulatedSignals: totalSignals,
      bufferedChannels: Array.from(this.messageBuffer.keys()).length
    };
  }
}

export const realtimeEngine = new RealtimeOptimizationEngine();
export default realtimeEngine;
