/**
 * DDSulf Lightweight Event Bus Interface
 * Secures high-throughput, non-blocking operational messaging.
 */

import { DDEvent, EventListenerCallback } from '../types';

export class EventBusService {
  private static listeners: Map<string, Set<EventListenerCallback>> = new Map();

  /**
   * Subscribes to specific system event key
   */
  public static subscribe(eventType: string, callback: EventListenerCallback): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    
    this.listeners.get(eventType)!.add(callback);
    
    // Returns clean unsubscribe function
    return () => {
      const active = this.listeners.get(eventType);
      if (active) {
        active.delete(callback);
        if (active.size === 0) {
          this.listeners.delete(eventType);
        }
      }
    };
  }

  /**
   * Triggers an action payload onto the bus, dispatching asynchronously
   */
  public static publish(type: string, payload: Record<string, any>, origin: 'client' | 'server' = 'client'): void {
    const event: DDEvent = {
      id: 'evt_' + Math.random().toString(36).substr(2, 9),
      type,
      payload,
      timestamp: Date.now(),
      origin
    };

    // Run dispatch asynchronously to prevent freezing main threads
    setTimeout(() => {
      // 1. Specific string exact match listeners
      const specific = this.listeners.get(type);
      if (specific) {
        specific.forEach(cb => {
          try {
            cb(event);
          } catch (err) {
            console.error(`[Event Bus] Listener callback error for: ${type}`, err);
          }
        });
      }

      // 2. Wildcard "*" match listeners
      const wildcards = this.listeners.get('*');
      if (wildcards) {
        wildcards.forEach(cb => {
          try {
            cb(event);
          } catch (err) {
            console.error(`[Event Bus] Global wildcard listener callback error: ${type}`, err);
          }
        });
      }
    }, 0);
  }
}

export default EventBusService;
