/**
 * Resilient viewport and safe inset layout calculator
 * Calculates live screen aspect layouts, dynamically avoiding notch overflows on mobile devices.
 */

import { useState, useEffect } from 'react';
import { ViewportBoundaries } from '../types';

export function useSafeArea(): ViewportBoundaries {
  const [viewport, setViewport] = useState<ViewportBoundaries>({
    width: typeof window !== 'undefined' ? window.innerWidth : 375,
    height: typeof window !== 'undefined' ? window.innerHeight : 812,
    isMobile: true,
    hasNotch: false,
    statusBarHeight: 0,
    bottomBarHeight: 0
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const computeMetrics = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      
      // Standard heuristic for notched iPhone layouts
      const maxDim = Math.max(w, h);
      const isIphoneXSeries = /iPhone/.test(navigator.userAgent) && (maxDim === 812 || maxDim === 896 || maxDim === 844 || maxDim === 926);
      
      setViewport({
        width: w,
        height: h,
        isMobile: w < 768,
        hasNotch: isIphoneXSeries,
        statusBarHeight: isIphoneXSeries ? 44 : 20,
        bottomBarHeight: isIphoneXSeries ? 34 : 16
      });
    };

    computeMetrics();
    window.addEventListener('resize', computeMetrics);
    return () => window.removeEventListener('resize', computeMetrics);
  }, []);

  return viewport;
}

export default useSafeArea;
