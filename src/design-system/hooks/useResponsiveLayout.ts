/**
 * Custom React Hook: useResponsiveLayout
 * Evaluates screen width dynamically to ensure optimized rendering of compact components.
 */

import { useState, useEffect } from 'react';

export function useResponsiveLayout() {
  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [width, setWidth] = useState<number>(1200);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const w = window.innerWidth;
      setWidth(w);
      if (w < 768) {
        setDevice('mobile');
      } else if (w < 1024) {
        setDevice('tablet');
      } else {
        setDevice('desktop');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    device,
    width,
    isMobile: device === 'mobile',
    isTablet: device === 'tablet',
    isDesktop: device === 'desktop',
    touchTargetMinHeight: device === 'mobile' ? '44px' : '36px'
  };
}

export default useResponsiveLayout;
