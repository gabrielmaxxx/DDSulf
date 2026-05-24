/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, useCallback } from 'react';
import { eventBusService } from '../services/eventBusService';
import { OperationalEventType, OperationalEvent, SystemModuleName } from '../types';

export function useEventBus() {
  const [history, setHistory] = useState<OperationalEvent[]>(() => eventBusService.getHistory());
  const [offlineQueue, setOfflineQueue] = useState<OperationalEvent[]>(() => eventBusService.getOfflineQueue());

  const refreshState = useCallback(() => {
    setHistory([...eventBusService.getHistory()]);
    setOfflineQueue([...eventBusService.getOfflineQueue()]);
  }, []);

  const publishEvent = useCallback(async (
    eventName: OperationalEventType,
    payload: any,
    sourceModule: SystemModuleName,
    correlationId?: string
  ) => {
    const fresh = await eventBusService.publish(eventName, payload, sourceModule, correlationId);
    refreshState();
    return fresh;
  }, [refreshState]);

  const clearBusHistory = useCallback(() => {
    eventBusService.clearStorage();
    refreshState();
  }, [refreshState]);

  const syncOfflineQueue = useCallback(async () => {
    const result = await eventBusService.syncOfflineWorkroom();
    refreshState();
    return result;
  }, [refreshState]);

  return {
    history,
    offlineQueue,
    publishEvent,
    clearBusHistory,
    syncOfflineQueue,
    refreshState
  };
}
export default useEventBus;
