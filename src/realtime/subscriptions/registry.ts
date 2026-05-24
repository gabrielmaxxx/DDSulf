import { ActiveSubscription, SubscriptionOptions } from '../types';
import { generateUUID } from '../utils';

type RawUnsubscribe = () => void;

interface RegistryEntry {
  id: string;
  path: string;
  type: 'document' | 'collection' | 'query';
  unsubscribe: RawUnsubscribe;
  listenerCount: number;
  options: SubscriptionOptions;
  createdAt: string;
}

export class SubscriptionRegistry {
  private static instance: SubscriptionRegistry;
  private registryMap = new Map<string, RegistryEntry>();

  public static getInstance(): SubscriptionRegistry {
    if (!SubscriptionRegistry.instance) {
      SubscriptionRegistry.instance = new SubscriptionRegistry();
    }
    return SubscriptionRegistry.instance;
  }

  /**
   * Registers a Firestore stream. If the path/query already has an active stream,
   * reuse it and increment references instead of opening another WebSocket connection.
   */
  public register(
    path: string,
    type: 'document' | 'collection' | 'query',
    subscribeFn: () => RawUnsubscribe,
    options: SubscriptionOptions = {}
  ): RawUnsubscribe {
    const existingEntry = this.registryMap.get(path);

    if (existingEntry) {
      existingEntry.listenerCount += 1;
      if (process.env.NODE_ENV !== 'production') {
        console.log(
          `♻️ [SubscriptionRegistry] Reusing listener for "${path}". Count: ${existingEntry.listenerCount}`
        );
      }
      
      // Return custom unsubscribe that decrements count
      return () => this.deregister(path);
    }

    // First time subscribing: create the real listener stream
    const unsubscribe = subscribeFn();
    const newEntry: RegistryEntry = {
      id: generateUUID('sub'),
      path,
      type,
      unsubscribe,
      listenerCount: 1,
      options,
      createdAt: new Date().toISOString(),
    };

    this.registryMap.set(path, newEntry);

    if (process.env.NODE_ENV !== 'production') {
      console.log(`🔌 [SubscriptionRegistry] Created fresh listener for "${path}"`);
    }

    return () => this.deregister(path);
  }

  /**
   * Decrements references; if 0 references exist, perform genuine unmount and close stream
   */
  private deregister(path: string): void {
    const entry = this.registryMap.get(path);
    if (!entry) return;

    entry.listenerCount -= 1;

    if (entry.listenerCount <= 0) {
      try {
        entry.unsubscribe();
      } catch (err) {
        console.error(`[SubscriptionRegistry] Error destroying subscription on "${path}":`, err);
      }
      this.registryMap.delete(path);
      if (process.env.NODE_ENV !== 'production') {
        console.log(`🚫 [SubscriptionRegistry] Disconnected and killed listener on "${path}"`);
      }
    } else {
      if (process.env.NODE_ENV !== 'production') {
        console.log(
          `👥 [SubscriptionRegistry] Decremented listener on "${path}". Remaining: ${entry.listenerCount}`
        );
      }
    }
  }

  /**
   * Reports all currently active subscriptions
   */
  public getActiveSubscriptions(): ActiveSubscription[] {
    return Array.from(this.registryMap.values()).map((entry) => ({
      id: entry.id,
      path: entry.path,
      type: entry.type,
      createdAt: entry.createdAt,
      listenerCount: entry.listenerCount,
      networkPriority: entry.options.priority || 'normal',
    }));
  }

  /**
   * Force dismantle of entire connection pool (reconnects/resets)
   */
  public disconnectAll(): void {
    this.registryMap.forEach((entry) => {
      try {
        entry.unsubscribe();
      } catch (e) {
        // Safe skip
      }
    });
    this.registryMap.clear();
    console.log('[SubscriptionRegistry] Successfully severed all active WebSocket subscriptions.');
  }
}

export const subscriptionRegistry = SubscriptionRegistry.getInstance();
