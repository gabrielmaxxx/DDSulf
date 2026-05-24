/**
 * useMemoryProtection hook
 */

import { useEffect, useRef } from 'react';
import { createDisposalPool } from '../memory';

export function useMemoryProtection() {
  const disposalPoolRef = useRef(createDisposalPool());

  /**
   * Safe registers a timeout. Automatically collected on unmount.
   */
  const registerTimeout = (cb: () => void, delayMs: number): number => {
    const handle = setTimeout(cb, delayMs) as any;
    disposalPoolRef.current.register(handle);
    return handle;
  };

  /**
   * Safe registers an interval. Automatically collected on unmount.
   */
  const registerInterval = (cb: () => void, intervalMs: number): number => {
    const handle = setInterval(cb, intervalMs) as any;
    disposalPoolRef.current.register(handle);
    return handle;
  };

  /**
   * Safe registers an event listener with target element. Automatically collected on unmount.
   */
  const registerEventListener = (
    element: HTMLElement | Window,
    event: string,
    handler: (e: any) => void,
    options?: AddEventListenerOptions
  ) => {
    element.addEventListener(event, handler, options);
    
    disposalPoolRef.current.register(() => {
      element.removeEventListener(event, handler, options);
    });
  };

  /**
   * Safe tracks dynamic subscription disposer callback returned by Firestore/SDK
   */
  const registerSubscription = (unsubscribeCallback: () => void) => {
    disposalPoolRef.current.register(unsubscribeCallback);
  };

  useEffect(() => {
    return () => {
      // Sweep every single allocated listener, timer and socket stream on unmount
      disposalPoolRef.current.releaseAll();
    };
  }, []);

  return {
    registerTimeout,
    registerInterval,
    registerEventListener,
    registerSubscription,
    trackedResourceCount: disposalPoolRef.current.getTrackedCount()
  };
}
export default useMemoryProtection;
