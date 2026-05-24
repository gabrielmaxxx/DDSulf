/**
 * Enterprise-grade client storage persistence engine for DDSulf.
 * Prioritizes speed and safe local storage of drafts and offline synchronization queues.
 */

export class PersistenceService {
  private prefix = 'ddsulf_v1_';

  private isAvailable(): boolean {
    try {
      if (typeof window === 'undefined') return false;
      const x = '__storage_test__';
      window.localStorage.setItem(x, x);
      window.localStorage.removeItem(x);
      return true;
    } catch {
      return false;
    }
  }

  save<T>(key: string, data: T): void {
    if (!this.isAvailable()) return;
    try {
      const serialized = JSON.stringify({
        data,
        timestamp: new Date().toISOString()
      });
      window.localStorage.setItem(`${this.prefix}${key}`, serialized);
    } catch (e) {
      console.error(`[PersistenceService] Failed to serialize key "${key}":`, e);
    }
  }

  load<T>(key: string, fallback: T): T {
    if (!this.isAvailable()) return fallback;
    try {
      const raw = window.localStorage.getItem(`${this.prefix}${key}`);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed.data as T;
    } catch {
      return fallback;
    }
  }

  remove(key: string): void {
    if (!this.isAvailable()) return;
    window.localStorage.removeItem(`${this.prefix}${key}`);
  }

  clearAllDDSulfKeys(): void {
    if (!this.isAvailable()) return;
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => window.localStorage.removeItem(k));
    } catch (e) {
      console.error('[PersistenceService] Failed to bulk clear data:', e);
    }
  }

  getStorageReport(): { usedBytes: number; entryCount: number } {
    if (!this.isAvailable()) return { usedBytes: 0, entryCount: 0 };
    let size = 0;
    let count = 0;
    try {
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          const val = window.localStorage.getItem(key);
          size += (key.length + (val ? val.length : 0)) * 2; // Approximate UTF-16 bytes
          count++;
        }
      }
    } catch (e) {
      console.error('[PersistenceService] Storage report calculation anomaly:', e);
    }
    return { usedBytes: size, entryCount: count };
  }
}

export const persistenceService = new PersistenceService();
