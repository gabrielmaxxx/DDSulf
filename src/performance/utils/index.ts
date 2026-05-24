/**
 * DDSulf High-Performance Mathematical Utilities and Timing Filters
 */

/**
 * Super precise microsecond timer
 */
export function getCurrentHighResTime(): number {
  if (typeof performance !== 'undefined' && 'now' in performance) {
    return performance.now();
  }
  return Date.now();
}

/**
 * Lightweight passive throttle that prevents a callback from calling more than once per limit frame
 */
export function throttlePassive<F extends (...args: any[]) => any>(
  func: F,
  limitMs: number
): (...args: Parameters<F>) => void {
  let lastRan = 0;
  let timer: any = null;

  return function(this: any, ...args: Parameters<F>) {
    const context = this;
    const now = Date.now();

    const trigger = () => {
      lastRan = now;
      func.apply(context, args);
    };

    if (!lastRan || now - lastRan >= limitMs) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      trigger();
    } else {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        trigger();
      }, limitMs - (now - lastRan));
    }
  };
}

/**
 * Lightweight micro-optimized debounce helper
 */
export function debouncePassive<F extends (...args: any[]) => any>(
  func: F,
  delayMs: number
): (...args: Parameters<F>) => void {
  let timer: any = null;

  return function(this: any, ...args: Parameters<F>) {
    const context = this;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(context, args);
    }, delayMs);
  };
}

/**
 * Super-fast memoizer for heavy computations (e.g. chemical dosages, coordinate indices calculations)
 */
export function memoizeFast<A extends any[], R>(
  func: (...args: A) => R
): (...args: A) => R {
  const cacheMap = new Map<string, R>();

  return function(...args: A): R {
    const key = JSON.stringify(args);
    if (cacheMap.has(key)) {
      return cacheMap.get(key) as R;
    }
    const result = func(...args);
    cacheMap.set(key, result);

    // Guard size count to prevent leak
    if (cacheMap.size > 200) {
      // Clear half of cache (FIFO eviction)
      const keys = Array.from(cacheMap.keys());
      for (let i = 0; i < 100; i++) {
        cacheMap.delete(keys[i]);
      }
    }

    return result;
  };
}

/**
 * Estimates approximated bytes size of a JS object
 */
export function estimateObjectMemorySizeInBytes(obj: any): number {
  const list = new Set<any>();
  const stack = [obj];
  let bytes = 0;

  while (stack.length) {
    const value = stack.pop();

    if (value && typeof value === 'object' && !list.has(value)) {
      list.add(value);
      for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          bytes += key.length * 2;
          stack.push(value[key]);
        }
      }
    } else if (typeof value === 'string') {
      bytes += value.length * 2;
    } else if (typeof value === 'number') {
      bytes += 8;
    } else if (typeof value === 'boolean') {
      bytes += 4;
    }
  }

  return bytes;
}
