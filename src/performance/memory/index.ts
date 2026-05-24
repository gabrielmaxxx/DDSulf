/**
 * DDSulf Memory Lifecycle & Disposal Hardening Engine
 */

type DisposableTarget = 
  | { unsubscribe: () => void }
  | { remove: () => void }
  | (() => void)
  | number; // intervals / timeout IDs

class MemoryDisposalPool {
  private resources = new Set<DisposableTarget>();

  /**
   * Tracks a resource and registers it for disposal at unmount
   */
  public register(resource: DisposableTarget): DisposableTarget {
    if (resource) {
      this.resources.add(resource);
    }
    return resource;
  }

  /**
   * Disposes all registered timers, cleanups, subscriptions, and event handles
   */
  public releaseAll(): number {
    let count = 0;
    this.resources.forEach(resource => {
      try {
        if (typeof resource === 'function') {
          resource();
        } else if (typeof resource === 'number') {
          // Clear interval/timeout dynamically
          clearTimeout(resource);
          clearInterval(resource);
        } else if ('unsubscribe' in resource && typeof resource.unsubscribe === 'function') {
          resource.unsubscribe();
        } else if ('remove' in resource && typeof resource.remove === 'function') {
          resource.remove();
        }
        count++;
      } catch {
        // Safe bypass failure to proceed with other resources
      }
    });

    this.resources.clear();
    return count;
  }

  public getTrackedCount(): number {
    return this.resources.size;
  }
}

/**
 * Creates a scoped memory disposer block
 */
export function createDisposalPool() {
  return new MemoryDisposalPool();
}

/**
 * Enterprise GC (Garbage Collection) Simulator Utility
 * Forces heap-cleanup loops by dereferencing cache elements and clearing orphaned event queues
 */
export function purgeOrphanedReferences() {
  try {
    // In browser, help engine gc cycle by wiping defunct event emitter collections from window context if lingering
    const w = window as any;
    if (w.__ddsulf_orphaned_listeners) {
      w.__ddsulf_orphaned_listeners.forEach((clean: any) => {
        try { clean(); } catch {}
      });
      w.__ddsulf_orphaned_listeners = [];
    }
    return true;
  } catch {
    return false;
  }
}
