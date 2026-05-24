/**
 * usePerformanceTelemetry performance hook
 */

import { useEffect, useRef, useCallback } from 'react';
import { performanceTelemetryService } from '../services';

export function usePerformanceTelemetry(componentName: string) {
  const mountTime = useRef(performance.now());

  useEffect(() => {
    const elapsed = performance.now() - mountTime.current;
    
    // Log mount speed into telemetry RUM under 15ms threshold
    performanceTelemetryService.reportEvent(
      `${componentName}:mount_time`,
      elapsed,
      'render_cycle',
      15.0, // amber
      50.0  // red critical
    );

    return () => {
      const shutdownDuration = performance.now() - mountTime.current;
      performanceTelemetryService.reportEvent(
        `${componentName}:lifetime`,
        shutdownDuration,
        'render_cycle',
        10000.0,
        60000.0
      );
    };
  }, [componentName]);

  /**
   * Tracks discrete component actions lag (e.g. click on complex filters list)
   */
  const captureInteractionLatency = useCallback((actionName: string, executionCallback: () => void) => {
    const start = performance.now();
    try {
      executionCallback();
    } finally {
      const duration = performance.now() - start;
      performanceTelemetryService.logUserInteraction(`${componentName}:${actionName}`, duration);
    }
  }, [componentName]);

  return {
    captureInteractionLatency,
    telemetryStats: performanceTelemetryService.getSystemAuditRecord()
  };
}
