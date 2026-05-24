/**
 * Hook: useAdaptiveRendering
 * Inspects device capabilities or global flag, dropping non-vital visual cards on low-tier field devices.
 */

import { useState, useEffect } from 'react';
import { performanceMonitoringService, scalabilityService } from '../services';

export function useAdaptiveRendering() {
  const [isLowEndDevice, setIsLowEndDevice] = useState(() => performanceMonitoringService.getDiagnostics().lowEndModeActive);
  const [deviceQuotaAdvice, setDeviceQuotaAdvice] = useState(() => scalabilityService.getBatchQuotaAdvice(isLowEndDevice));

  const toggleAdaptivePerformanceMode = () => {
    const isNewActive = performanceMonitoringService.toggleLowEndMode();
    setIsLowEndDevice(isNewActive);
    setDeviceQuotaAdvice(scalabilityService.getBatchQuotaAdvice(isNewActive));
  };

  return {
    isLowEndDevice,
    deviceQuotaAdvice,
    toggleAdaptivePerformanceMode,
    suggestedMaxTableRows: deviceQuotaAdvice.fetchLimit
  };
}
