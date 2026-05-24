/**
 * useRenderOptimization performance hook
 */

import { useEffect, useRef } from 'react';
import { useRenderMeasurement } from '../rendering';
import { renderingOptimizationService } from '../services';

export function useRenderOptimization(componentName: string, debug: boolean = false) {
  const measurement = useRenderMeasurement(componentName);

  // Inform the governing service about components repaints on every render execution
  renderingOptimizationService.logRenderCycle(measurement);

  useEffect(() => {
    if (debug && process.env.NODE_ENV !== 'production') {
      console.log(
        `[DDSulf Render Diagnostics] ${componentName} mounted. ` +
        `Trace peak repaint time: ${measurement.peakDurMs}ms | Cumulative render count: ${measurement.renderCount}`
      );
    }

    return () => {
      if (debug && process.env.NODE_ENV !== 'production') {
        console.log(`[DDSulf Render Diagnostics] ${componentName} unmounted.`);
      }
    };
  }, [componentName, debug]);

  return {
    renderCount: measurement.renderCount,
    avgDurMs: measurement.avgDurMs,
    peakDurMs: measurement.peakDurMs,
    lastDurMs: measurement.lastDurMs
  };
}
