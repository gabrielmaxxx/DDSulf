/**
 * useRealtimePerformance hook
 */

import { useEffect, useRef, useState } from 'react';
import { realtimeEngine } from '../realtime';
import { realtimeOptimizationService } from '../services';

export function useRealtimePerformance<T>(
  channelId: string,
  streamName: string,
  tenantId: string,
  initialData: T,
  throttleDelayMs: number = 250
) {
  const [liveState, setLiveState] = useState<T>(initialData);
  const queueBuffer = useRef<any[]>([]);

  useEffect(() => {
    // Acquire stream access lease under multi-tenant sharing framework
    realtimeOptimizationService.leaseStream(channelId, streamName, tenantId);

    return () => {
      // Cleanly yield stream lease
      realtimeOptimizationService.endLeaseStream(channelId);
    };
  }, [channelId, streamName, tenantId]);

  /**
   * Safe pushes incoming socket updates to backpressure monitor and updates React state in batches
   */
  const pushIncomingUpdate = (payload: any, onBatchMerged: (items: any[]) => T) => {
    queueBuffer.current.push(payload);
    
    // Track stats
    realtimeOptimizationService.monitorBackpressure(channelId, queueBuffer.current.length);

    realtimeEngine.handleStreamingSignal(
      channelId,
      payload,
      (batch) => {
        // Feed the batch to translation callback and paint state
        if (batch.length > 0) {
          setLiveState(onBatchMerged(batch));
          queueBuffer.current = [];
          realtimeOptimizationService.monitorBackpressure(channelId, 0); // Reset metric representation
        }
      },
      throttleDelayMs
    );
  };

  return {
    liveState,
    setLiveState,
    pushIncomingUpdate,
    bufferSize: queueBuffer.current.length
  };
}
