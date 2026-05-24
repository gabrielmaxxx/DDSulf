/**
 * DDSulf Realtime Optimization Service
 * Implements Firestore socket backpressure controllers, listener pooling and signal flow tracking.
 */

import { realtimeEngine } from '../realtime';
import { RealtimeBackpressureMetric } from '../types';

class RealtimeOptimizationService {
  private backpressureMetrics = new Map<string, RealtimeBackpressureMetric>();

  /**
   * Tracks signal density and updates throttled buffer limits dynamically
   */
  public monitorBackpressure(channelId: string, currentBufferCount: number): RealtimeBackpressureMetric {
    let metric = this.backpressureMetrics.get(channelId);

    if (!metric) {
      metric = {
        channelId,
        bufferedCount: currentBufferCount,
        droppedCount: 0,
        flushFrequencyMs: 350
      };
    } else {
      metric.bufferedCount = currentBufferCount;
    }

    // Adaptive backpressure control: if buffers pile up, raise flush frequency to protect CPU cycles
    if (currentBufferCount > 20) {
      metric.flushFrequencyMs = 500; // Throttle down cycles
    } else if (currentBufferCount > 35) {
      metric.flushFrequencyMs = 800;
      metric.droppedCount += 1; // Signal drops/fifo skips happening
    } else {
      metric.flushFrequencyMs = 250; // Restore nominal low delay
    }

    this.backpressureMetrics.set(channelId, metric);
    return metric;
  }

  public getBackpressureReport(): RealtimeBackpressureMetric[] {
    return Array.from(this.backpressureMetrics.values());
  }

  /**
   * Safe registers client streams under centralized deduplication pooling
   */
  public leaseStream(channelId: string, streamName: string, tenantId: string): boolean {
    return realtimeEngine.registerLease(channelId, streamName, tenantId, true);
  }

  public endLeaseStream(channelId: string): boolean {
    return realtimeEngine.releaseLease(channelId);
  }
}

export const realtimeOptimizationService = new RealtimeOptimizationService();
export default realtimeOptimizationService;
