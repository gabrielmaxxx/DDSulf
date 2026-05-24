/**
 * Enterprise Performance, Network, and Memory Utilities
 * Purpose-built for high-speed calculation, debounce controls, and Firestore payload validation.
 */

/**
 * Throttle any incoming execution to prevent high-frequency Firestore callback exhaustion
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: any = null;
  let lastArgs: Parameters<T> | null = null;
  let lastContext: any = null;
  let lastCall: number = 0;

  const execute = () => {
    lastCall = Date.now();
    timeout = null;
    if (lastArgs) {
      func.apply(lastContext, lastArgs);
      lastArgs = null;
    }
  };

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now();
    const remaining = wait - (now - lastCall);
    lastContext = this;

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      lastCall = now;
      func.apply(lastContext, args);
    } else if (!timeout) {
      lastArgs = args;
      timeout = setTimeout(execute, remaining);
    }
  };
}

/**
 * Custom debouncer with immediate trigger parameter
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: any;
  return function (this: any, ...args: Parameters<T>) {
    const context = this;
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

/**
 * Structural deep comparator to detect true changes and prevent irrelevant state updates
 */
export function deepEquals(objA: any, objB: any): boolean {
  if (objA === objB) return true;
  if (objA == null || objB == null) return false;
  if (typeof objA !== 'object' || typeof objB !== 'object') return false;

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!deepEquals(objA[key], objB[key])) return false;
  }
  return true;
}

/**
 * Approximates payload string sizes in bytes to help manage mobile bandwidth limits
 */
export function estimatePayloadSize(payload: any): number {
  if (payload === undefined) return 0;
  const str = typeof payload === 'string' ? payload : JSON.stringify(payload);
  let bytes = 0;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    bytes += code <= 0x7f ? 1 : code <= 0x7ff ? 2 : 3;
  }
  return bytes;
}

/**
 * Generate cryptographic-grade collision-resistant random string identifiers
 */
export function generateUUID(prefix = ''): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = prefix ? `${prefix}_` : '';
  const charactersLength = characters.length;
  for (let i = 0; i < 16; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

/**
 * Standard rounding helper for currency and percentage precision
 */
export function formatCurrencyBR(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}
