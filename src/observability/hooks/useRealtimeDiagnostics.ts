/**
 * Hook: useRealtimeDiagnostics
 * Diagnoses active sync paths, network channels stability, and mock propagation.
 */

import { useState } from 'react';
import { diagnosticsService } from '../services';

export function useRealtimeDiagnostics() {
  const [dbState, setDbState] = useState<'optimal' | 'degraded' | 'critical'>('optimal');
  const [socketState, setSocketState] = useState<'connected' | 'unstable' | 'disconnected'>('connected');

  const calibrateConnectionState = (state: 'connected' | 'unstable' | 'disconnected') => {
    diagnosticsService.setSocketState(state);
    setSocketState(state);
  };

  const calibrateDatabaseState = (state: 'optimal' | 'degraded' | 'critical') => {
    diagnosticsService.setDatabaseHealth(state);
    setDbState(state);
  };

  return {
    dbState,
    socketState,
    calibrateConnectionState,
    calibrateDatabaseState
  };
}
