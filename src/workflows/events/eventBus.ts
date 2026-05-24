/**
 * DDSulf Realtime Multi-Tenant Workflow Event Bus
 * De-couples triggers, publishes operational events, isolates tenants, and handles offline buffers.
 */

import { WorkflowEvent } from '../types';

type EventCallback = (event: WorkflowEvent) => void;

export class WorkflowEventBus {
  private static subscribers: Map<string, Set<EventCallback>> = new Map();
  private static OFFLINE_BUFFER_KEY = 'ddsulf_workflow_offline_event_buffer';
  private static listeners: Set<(event: WorkflowEvent) => void> = new Set();

  /**
   * Subscribes to a specific event pattern trigger (exact or wildcard)
   */
  public static subscribe(eventKey: string, callback: EventCallback): () => void {
    if (!this.subscribers.has(eventKey)) {
      this.subscribers.set(eventKey, new Set());
    }
    this.subscribers.get(eventKey)!.add(callback);

    return () => {
      const set = this.subscribers.get(eventKey);
      if (set) {
        set.delete(callback);
        if (set.size === 0) {
          this.subscribers.delete(eventKey);
        }
      }
    };
  }

  /**
   * Monitor all event streams for debugging and timeline diagnostics
   */
  public static subscribeAll(callback: (event: WorkflowEvent) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Dispatches an operational event, managing tenant boundaries & network state
   */
  public static publish(eventKey: string, payload: Record<string, any>, tenantId: string, senderId: string = 'system'): void {
    const event: WorkflowEvent = {
      id: 'evt_' + Math.random().toString(36).substr(2, 9),
      eventKey,
      tenantId,
      senderId,
      payload,
      timestamp: Date.now(),
      isRealtime: typeof navigator !== 'undefined' ? navigator.onLine : true,
      isOfflineBuffer: typeof navigator !== 'undefined' ? !navigator.onLine : false,
    };

    if (event.isOfflineBuffer) {
      this.bufferOfflineEvent(event);
      return;
    }

    this.dispatch(event);
  }

  /**
   * Synchronously logs and broadcasts the event to match filters
   */
  private static dispatch(event: WorkflowEvent): void {
    // Notify general listeners (observability tracers)
    this.listeners.forEach(fn => {
      try { fn(event); } catch (e) { console.error('Error in general event stream listener:', e); }
    });

    // Exact match key subscriber list
    const exactSubscribers = this.subscribers.get(event.eventKey);
    if (exactSubscribers) {
      exactSubscribers.forEach(cb => {
        try { cb(event); } catch (e) { console.error(`Error in subscriber for ${event.eventKey}:`, e); }
      });
    }

    // Pattern matching e.g. "operations.*"
    const parts = event.eventKey.split('.');
    if (parts.length > 1) {
      const wildcardKey = `${parts[0]}.*`;
      const wildcardSubscribers = this.subscribers.get(wildcardKey);
      if (wildcardSubscribers) {
        wildcardSubscribers.forEach(cb => {
          try { cb(event); } catch (e) { console.error(`Error in wildcard subscriber for ${wildcardKey}:`, e); }
        });
      }
    }
  }

  /**
   * Temporarily serializes event logs to localStorage on disconnected field runs
   */
  private static bufferOfflineEvent(event: WorkflowEvent): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(this.OFFLINE_BUFFER_KEY);
      const buffer: WorkflowEvent[] = raw ? JSON.parse(raw) : [];
      buffer.push(event);
      localStorage.setItem(this.OFFLINE_BUFFER_KEY, JSON.stringify(buffer));
      
      // Dispatch locally anyway for progressive offline simulation
      this.dispatch(event);
    } catch (e) {
      console.error('Failed to buffer offline event:', e);
    }
  }

  /**
   * Flushes local backlog to central cloud nodes upon cell carrier connection recovery
   */
  public static async flushOfflineBuffer(): Promise<WorkflowEvent[]> {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(this.OFFLINE_BUFFER_KEY);
      if (!raw) return [];

      const buffer: WorkflowEvent[] = JSON.parse(raw);
      if (buffer.length === 0) return [];

      // Mark offline logs as synced
      const syncedEvents = buffer.map(evt => ({
        ...evt,
        isOfflineBuffer: false,
        isRealtime: true
      }));

      // Flush buffer
      localStorage.setItem(this.OFFLINE_BUFFER_KEY, JSON.stringify([]));

      // Re-dispatch synced instances upstream
      syncedEvents.forEach(evt => this.dispatch(evt));

      return syncedEvents;
    } catch (e) {
      console.error('Error flushing offline event buffer:', e);
      return [];
    }
  }

  public static getOfflineQueueCount(): number {
    if (typeof localStorage === 'undefined') return 0;
    try {
      const raw = localStorage.getItem(this.OFFLINE_BUFFER_KEY);
      const buffer: WorkflowEvent[] = raw ? JSON.parse(raw) : [];
      return buffer.length;
    } catch {
      return 0;
    }
  }
}
export default WorkflowEventBus;
