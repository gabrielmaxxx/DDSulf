/**
 * DDSulf Progressive & Safe Hydration Guard
 */

import React, { useState, useEffect } from 'react';

interface HydrationSafeBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Ensures children render ONLY after initial client mounts to bypass
 * SSR/Hydration differences when reading customer variables or local states.
 */
export function HydrationSafeBoundary({ children, fallback = null }: HydrationSafeBoundaryProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Hydrates component progressively inside an idle callback frame,
 * deferring non-interactive overlays (like details drawers, logs, filters) first mount.
 */
export function ProgressiveHydrationContainer({ 
  children, 
  fallback = null, 
  delayMs = 200 
}: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode; 
  delayMs?: number;
}) {
  const [shouldHydrate, setShouldHydrate] = useState(false);

  useEffect(() => {
    let idleToken: any;

    const requestMount = () => {
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        idleToken = window.requestIdleCallback(() => setShouldHydrate(true));
      } else {
        idleToken = setTimeout(() => setShouldHydrate(true), delayMs);
      }
    };

    requestMount();

    return () => {
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window && idleToken) {
        window.cancelIdleCallback(idleToken);
      } else if (idleToken) {
        clearTimeout(idleToken);
      }
    };
  }, [delayMs]);

  if (!shouldHydrate) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
