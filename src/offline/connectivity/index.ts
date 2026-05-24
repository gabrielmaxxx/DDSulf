/**
 * DDSulf High-Resolution Connectivity Monitor
 * Detects network transitions, evaluates latencies against health check endpoints, and adapts replication speeds.
 */

import { ConnectivityState, NetworkMode } from '../types';

export type ConnectivityListener = (state: ConnectivityState) => void;

export class ConnectivityService {
  private static listeners = new Set<ConnectivityListener>();
  private static currentState: ConnectivityState = {
    isOnline: true,
    latencyMs: 15,
    mode: 'premium',
    lastCheckedAt: Date.now()
  };

  private static intervalId: any = null;

  public static initialize(): void {
    if (typeof window === 'undefined') return;

    // Standard online/offline DOM signals
    window.addEventListener('online', () => this.handleNetworkChange(true));
    window.addEventListener('offline', () => this.handleNetworkChange(false));

    // Initial check
    this.handleNetworkChange(navigator.onLine);

    // Dynamic latency check intervals (30s checks for resilient systems)
    this.intervalId = setInterval(() => {
      this.evaluateLatency();
    }, 30000);
  }

  public static destroy(): void {
    if (typeof window === 'undefined') return;
    clearInterval(this.intervalId);
  }

  public static subscribe(listener: ConnectivityListener): () => void {
    this.listeners.add(listener);
    // Instant update to subscriber
    listener(this.currentState);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public static getState(): ConnectivityState {
    return this.currentState;
  }

  private static handleNetworkChange(isOnline: boolean) {
    if (!isOnline) {
      this.updateState({
        isOnline: false,
        latencyMs: 0,
        mode: 'offline',
        lastCheckedAt: Date.now()
      });
    } else {
      this.evaluateLatency();
    }
  }

  /**
   * Performance-driven Latency and bandwidth grade classification
   */
  public static async evaluateLatency(): Promise<void> {
    if (typeof window === 'undefined' || !navigator.onLine) {
      return;
    }

    const start = performance.now();
    try {
      const controller = new AbortController();
      const signalTimeout = setTimeout(() => controller.abort(), 6000);

      const response = await fetch('/api/health', { 
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal
      });
      
      clearTimeout(signalTimeout);

      if (response.ok) {
        const delta = Math.round(performance.now() - start);
        let mode: NetworkMode = 'premium';

        if (delta > 400) {
          mode = 'degraded'; // GPRS, High congestion on countryside farms
        }

        this.updateState({
          isOnline: true,
          latencyMs: delta,
          mode,
          lastCheckedAt: Date.now()
        });
      } else {
        throw new Error('Healthy ping endpoint returned non-healthy response.');
      }
    } catch {
      // Degrade connection state without throwing
      this.updateState({
        isOnline: false,
        latencyMs: 9999,
        mode: 'offline',
        lastCheckedAt: Date.now()
      });
    }
  }

  private static updateState(partial: ConnectivityState) {
    this.currentState = partial;
    this.listeners.forEach(listener => {
      try {
        listener(this.currentState);
      } catch (err) {
        console.error('[Connectivity Listener] Catch-all boundary crashed', err);
      }
    });
  }
}
