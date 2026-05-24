/**
 * Hook: useRealtimeOptimization
 * Optimizes websocket streams, registers channels, and aggregates signals using time throttling.
 */

import { useState, useEffect } from 'react';
import { realtimeOrchestrationService } from '../services';

export function useRealtimeOptimization(channelKey: string) {
  const [messagesBatch, setMessagesBatch] = useState<any[]>([]);
  const [activeSubscriptions, setActiveSubscriptions] = useState<any[]>([]);

  useEffect(() => {
    // Register listener on mount
    realtimeOrchestrationService.registerSubscription(channelKey, `Stream_${channelKey}`);
    setActiveSubscriptions([...realtimeOrchestrationService.getActiveSubscriptions()]);

    return () => {
      // Cleanup subscription on unmount to keep socket connection bounds clean
      realtimeOrchestrationService.removeSubscription(channelKey);
    };
  }, [channelKey]);

  const dispatchIncomingSocketSignal = (payload: any) => {
    realtimeOrchestrationService.pushMutationSignal(channelKey, payload, (batch) => {
      setMessagesBatch(batch);
    });
  };

  return {
    messagesBatch,
    dispatchIncomingSocketSignal,
    activeSubscriptionsCount: activeSubscriptions.length,
    activeConnections: activeSubscriptions
  };
}
