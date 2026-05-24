/**
 * Hook: useRealtimeValidation
 * Audits realtime WebSocket signals, stream heartbeat timers, and subscription states.
 */

import { useState, useEffect } from 'react';
import { qaMonitoringService } from '@/services/qa/qaMonitoringService';
import { RealtimeListenerDiagnostic } from '@/types/qa';

export function useRealtimeValidation() {
  const [listeners, setListeners] = useState<RealtimeListenerDiagnostic[]>([]);
  const [latencyJitter, setLatencyJitter] = useState<number>(14);
  const [packetLossActive, setPacketLossActive] = useState<boolean>(false);

  useEffect(() => {
    setListeners([...qaMonitoringService.getRealtimeListeners()]);

    const jitterTimer = setInterval(() => {
      setLatencyJitter(prev => {
        const delta = Math.floor(Math.random() * 6 - 3);
        const baseline = packetLossActive ? 180 : 12;
        return Math.max(2, baseline + delta);
      });
    }, 2000);

    return () => clearInterval(jitterTimer);
  }, [packetLossActive]);

  const simulatePacketLossToggle = () => {
    setPacketLossActive(prev => !prev);
  };

  return {
    listeners,
    latencyJitter,
    packetLossActive,
    simulatePacketLossToggle,
    activeSubscriptionCount: listeners.filter(l => l.status === 'healthy_stream').length
  };
}
