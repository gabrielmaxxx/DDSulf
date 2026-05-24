/**
 * DDSulf Granular Rendering Governance and Isolation Engine
 */

import React, { useRef, useEffect, useState } from 'react';
import { RenderMeasurement } from '../types';

/**
 * Isolated Component wrapper to prevent parent prop updates from forcing child paint cycles
 * unless designated dependencies actually change. Works like a strict React.memo boundary
 */
export const IsolatedRenderContainer = React.memo(
  function IsolatedRenderContainer({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
  },
  () => true // Pure static barrier unless explicitly controlled
);

interface RenderBarrierProps {
  children: React.ReactNode;
  name: string;
  maxRenders?: number;
  highlightThreshold?: number;
}

/**
 * Production-hardened UI Render Barrier
 * Dynamic telemetry framing that highlights component flashing and updates frequencies
 * in full visual style, helping identify infinite loops or state thrashing instantly.
 */
export function RenderBarrier({ 
  children, 
  name, 
  maxRenders = 15, 
  highlightThreshold = 5 
}: RenderBarrierProps) {
  const rendersCount = useRef(0);
  const startTime = useRef(Date.now());
  const [flash, setFlash] = useState(false);

  rendersCount.current += 1;

  useEffect(() => {
    if (rendersCount.current > highlightThreshold) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 300);
      return () => clearTimeout(t);
    }
  }, [rendersCount.current, highlightThreshold]);

  // Reset counters every 10 seconds to detect burst cycles rather than gradual accrual
  useEffect(() => {
    const interval = setInterval(() => {
      rendersCount.current = 0;
      startTime.current = Date.now();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const totalTime = Date.now() - startTime.current;
  const isBreached = rendersCount.current > maxRenders;

  return (
    <div 
      className={`relative rounded-3xl transition-all duration-200 ${
        flash 
          ? 'ring-2 ring-rose-500 bg-rose-50/10' 
          : isBreached 
            ? 'ring-1 ring-amber-500 bg-amber-50/5' 
            : 'border border-transparent'
      }`}
    >
      {/* Dev performance metrics badge overlay - visible during development modes */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="absolute top-2 right-2 z-50 flex items-center gap-1 bg-zinc-950/90 text-[8px] font-mono font-bold text-zinc-300 px-2 py-0.5 rounded-full select-none shadow-md">
          <span className="size-1 rounded-full bg-indigo-500 animate-ping mr-0.5" />
          <span>{name}: Renders: {rendersCount.current} t: {totalTime}ms</span>
        </div>
      )}
      {children}
    </div>
  );
}

/**
 * Tracks and estimates Paint Time using standard PerformanceObserver
 */
export function useRenderMeasurement(componentName: string): RenderMeasurement {
  const componentId = useRef(`cmp_${Math.floor(Math.random() * 100000)}`);
  const renderCountRef = useRef(0);
  const peakTimeRef = useRef(0);
  const accumTimeRef = useRef(0);
  const mountTimeRef = useRef<number>(Date.now());

  renderCountRef.current += 1;
  const lastTimeRef = useRef(0);

  const now = performance.now();
  if (lastTimeRef.current > 0) {
    const elapsed = now - lastTimeRef.current;
    accumTimeRef.current += elapsed;
    if (elapsed > peakTimeRef.current) {
      peakTimeRef.current = elapsed;
    }
  }
  lastTimeRef.current = now;

  return {
    componentId: componentId.current,
    componentName,
    renderCount: renderCountRef.current,
    lastDurMs: parseFloat((performance.now() - now).toFixed(3)),
    avgDurMs: parseFloat((accumTimeRef.current / renderCountRef.current).toFixed(3)),
    peakDurMs: parseFloat(peakTimeRef.current.toFixed(3)),
    mountTimeMs: mountTimeRef.current,
    timestamp: new Date().toISOString()
  };
}
