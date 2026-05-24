/**
 * Hook: usePerformanceMonitoring
 * Fetches diagnostic parameters, frame rates, and registers active custom render budgets.
 */

import { useState, useEffect } from 'react';
import { performanceMonitoringService } from '../services';
import { PerformanceDiagnostics, RenderBudget } from '../types';

export function usePerformanceMonitoring() {
  const [diagnostics, setDiagnostics] = useState<PerformanceDiagnostics>(() => performanceMonitoringService.getDiagnostics());
  const [renderBudgets, setRenderBudgets] = useState<RenderBudget[]>(() => performanceMonitoringService.getRenderBudgets());

  useEffect(() => {
    const updateInterval = setInterval(() => {
      setDiagnostics(performanceMonitoringService.getDiagnostics());
      setRenderBudgets([...performanceMonitoringService.getRenderBudgets()]);
    }, 2000);

    return () => clearInterval(updateInterval);
  }, []);

  return {
    diagnostics,
    renderBudgets,
    isLowEndActive: diagnostics.lowEndModeActive,
    refreshDiagnostics: () => setDiagnostics(performanceMonitoringService.getDiagnostics())
  };
}
