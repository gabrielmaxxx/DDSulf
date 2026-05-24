import { RealtimeEvent, RealtimeEventType } from '../types';
import { generateUUID } from '../utils';

type EventListenerCallback<P = any> = (event: RealtimeEvent<P>) => void;

export class RealtimeEventBus {
  private static instance: RealtimeEventBus;
  private listenersMap = new Map<string, Set<EventListenerCallback>>();

  public static getInstance(): RealtimeEventBus {
    if (!RealtimeEventBus.instance) {
      RealtimeEventBus.instance = new RealtimeEventBus();
    }
    return RealtimeEventBus.instance;
  }

  /**
   * Subscribe to a specific realtime event channel
   */
  public subscribe<P = any>(
    eventType: RealtimeEventType,
    callback: EventListenerCallback<P>
  ): () => void {
    if (!this.listenersMap.has(eventType)) {
      this.listenersMap.set(eventType, new Set());
    }
    const currentListeners = this.listenersMap.get(eventType)!;
    currentListeners.add(callback);

    // Unsubscribe helper
    return () => {
      const listeners = this.listenersMap.get(eventType);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.listenersMap.delete(eventType);
        }
      }
    };
  }

  /**
   * Publish an event to all interested subscribers asynchronously
   */
  public publish<P = any>(
    eventType: RealtimeEventType,
    payload: P,
    senderId = 'local_client',
    correlationId?: string
  ): RealtimeEvent<P> {
    const event: RealtimeEvent<P> = {
      id: generateUUID('evt'),
      type: eventType,
      payload,
      timestamp: new Date().toISOString(),
      senderId,
      correlationId,
    };

    // Log the operational event pipeline in development
    if (process.env.NODE_ENV !== 'production') {
      console.log(
        `%c⚡ [EventBus] ${eventType} published:`,
        'color: #0ea5e9; font-weight: bold;',
        event
      );
    }

    const set = this.listenersMap.get(eventType);
    if (set) {
      // Execute each callback inside a microtask queue to avoid blockings
      set.forEach((listener) => {
        try {
          Promise.resolve().then(() => listener(event));
        } catch (err) {
          console.error(`[EventBus] Error in listener for event type "${eventType}":`, err);
        }
      });
    }

    return event;
  }

  /**
   * Clear all current active subscriptions
   */
  public destroy(): void {
    this.listenersMap.clear();
  }
}

export const eventBus = RealtimeEventBus.getInstance();
