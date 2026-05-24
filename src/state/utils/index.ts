/**
 * DDSulf State Management & Calculation Utilities
 */

/**
 * Format bytes into readable format
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Calculate net margin percentage based on cost and price
 */
export function calculateNetMarginPercent(cost: number, price: number): number {
  if (price <= 0) return 0;
  return Math.round(((price - cost) / price) * 100 * 10) / 10;
}

/**
 * Deep freezes an object to guarantee read-only status in complex operations
 */
export function deepFreeze<T extends object>(obj: T): T {
  const propNames = Object.getOwnPropertyNames(obj);
  for (const name of propNames) {
    const value = (obj as any)[name];
    if (value && typeof value === 'object') {
      deepFreeze(value);
    }
  }
  return Object.freeze(obj);
}

/**
 * Safe object cloner to support undo-redo buffers prevent references
 */
export function cloneState<T>(state: T): T {
  try {
    return JSON.parse(JSON.stringify(state));
  } catch (e) {
    console.error('[cloneState] Serialization failure during state snapshotting:', e);
    return state;
  }
}
