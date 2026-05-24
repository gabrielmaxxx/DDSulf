/**
 * Hook: useRealtimeMetrics
 * Subscribes user to live operational telemetry throughput (concurrency rate, active streams).
 */

import { useState, useEffect } from 'react';

export interface RealtimePulse {
  activeCrowsKg: number; // current active chemicals load in active routes
  liveOperatorCount: number;
  unpavedHectaresTreated: number;
  estimatedThroughputRatio: number; // e.g., 94.8%
  serverLatencyTimeMs: number;
}

export function useRealtimeMetrics() {
  const [pulse, setPulse] = useState<RealtimePulse>({
    activeCrowsKg: 450,
    liveOperatorCount: 4,
    unpavedHectaresTreated: 82.5,
    estimatedThroughputRatio: 99.1,
    serverLatencyTimeMs: 32
  });

  useEffect(() => {
    // Simulate real-time subtle offsets on telemetry timers
    const timer = setInterval(() => {
      setPulse(prev => {
        const offsetChem = Math.floor((Math.random() * 6) - 3);
        const offsetHectares = parseFloat(((Math.random() * 0.4) - 0.1).toFixed(2));
        const throughputSpeed = parseFloat((95.5 + Math.random() * 4.3).toFixed(1));
        const latencyOffset = Math.floor((Math.random() * 8) - 4);

        return {
          activeCrowsKg: Math.max(100, prev.activeCrowsKg + offsetChem),
          liveOperatorCount: prev.liveOperatorCount, // constant unless technician clocks out
          unpavedHectaresTreated: parseFloat(Math.max(10, prev.unpavedHectaresTreated + offsetHectares).toFixed(2)),
          estimatedThroughputRatio: throughputSpeed,
          serverLatencyTimeMs: Math.max(12, Math.min(120, prev.serverLatencyTimeMs + latencyOffset))
        };
      });
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return {
    pulse,
    serverLatencyTimeMs: pulse.serverLatencyTimeMs
  };
}
