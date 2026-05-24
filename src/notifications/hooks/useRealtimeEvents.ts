/**
 * Custom React Hook: useRealtimeEvents
 * Connects React components directly into reactive EventBus streams
 */

import { useEffect } from 'react';
import { EventBusService } from '../events/eventBus';
import { DDEvent } from '../types';

export function useRealtimeEvents(
  eventType: string,
  callback: (event: DDEvent) => void
) {
  useEffect(() => {
    const unsubscribe = EventBusService.subscribe(eventType, callback);
    return () => unsubscribe();
  }, [eventType, callback]);
}

export default useRealtimeEvents;
