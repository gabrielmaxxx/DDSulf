/**
 * Custom React Hook: useMotionPreferences
 * Checks if the user prefers reduced motion to increase performance on older low-end devices.
 */

import { useState, useEffect } from 'react';

export function useMotionPreferences() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  return {
    prefersReducedMotion,
    animationDurationFactor: prefersReducedMotion ? 0 : 1,
    easingPattern: 'cubic-bezier(0.16, 1, 0.3, 1)'
  };
}

export default useMotionPreferences;
