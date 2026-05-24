/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { eventBusService } from '../services/eventBusService';
import { IntegrationLog } from '../types';

export function useIntegrationTelemetry() {
  const [logs, setLogs] = useState<IntegrationLog[]>(() => eventBusService.getTelemetryLogs());

  const refreshLogs = useCallback(() => {
    setLogs([...eventBusService.getTelemetryLogs()]);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      refreshLogs();
    }, 1200);
    return () => clearInterval(t);
  }, [refreshLogs]);

  const clearAllLogs = useCallback(() => {
    eventBusService.clearStorage();
    refreshLogs();
  }, [refreshLogs]);

  return {
    logs,
    clearAllLogs,
    refreshLogs
  };
}
export default useIntegrationTelemetry;
