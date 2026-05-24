/**
 * Hook: useOperationalMonitoring
 */

import { useState, useEffect } from 'react';
import { observabilityService } from '../services/observabilityService';
import { OperationalMetric } from '../types';

export function useOperationalMonitoring() {
  const [metrics, setMetrics] = useState<OperationalMetric[]>([]);

  useEffect(() => {
    setMetrics(observabilityService.getLiveMetrics());

    const interval = setInterval(() => {
      // Simulate live jitter/updates in telemetry stream
      const last = metrics[metrics.length - 1] || {
        pwaCacheHits: 95,
        firestoreReads: 14,
        apiLatencyMs: 50,
        pwaSyncQueueSize: 0,
        activeRealtimeListeners: 12,
        pwaOfflineStatus: 'online',
        cpuUtilization: 24,
        memoryUsageMb: 145
      };

      observabilityService.pushMetric({
        pwaCacheHits: Math.max(85, Math.min(100, last.pwaCacheHits + (Math.random() > 0.5 ? 1 : -1))),
        firestoreReads: Math.max(5, Math.min(60, last.firestoreReads + Math.floor(Math.random() * 5 - 2))),
        apiLatencyMs: Math.max(30, Math.min(250, last.apiLatencyMs + Math.floor(Math.random() * 20 - 10))),
        pwaSyncQueueSize: Math.max(0, last.pwaSyncQueueSize + (Math.random() > 0.8 ? 1 : Math.random() > 0.8 ? -1 : 0)),
        activeRealtimeListeners: 14 + Math.floor(Math.random() * 3 - 1),
        pwaOfflineStatus: Math.random() > 0.98 ? 'offline' : 'online',
        cpuUtilization: Math.max(5, Math.min(99, (last.cpuUtilization ?? 24) + Math.floor(Math.random() * 6 - 3))),
        memoryUsageMb: Math.max(100, Math.min(512, (last.memoryUsageMb ?? 145) + Math.floor(Math.random() * 10 - 5)))
      });

      setMetrics([...observabilityService.getLiveMetrics()]);
    }, 4000);

    return () => clearInterval(interval);
  }, [metrics]);

  return {
    metrics,
    avgLatency: observabilityService.getAverageLatency()
  };
}
