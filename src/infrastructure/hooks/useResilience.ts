/**
 * Custom React Hook: useResilience
 * Decouples system dependencies, logs failures gracefully and initiates graceful UI degradation fallback.
 */

import { useState, useEffect } from 'react';
import { CrashReport } from '../types';
import { ResilienceService } from '../services/infrastructureServices';

export function useResilience() {
  const [reports, setReports] = useState<CrashReport[]>([]);
  const [systemHealth, setSystemHealth] = useState<'healthy' | 'degraded' | 'critical'>('healthy');

  const reload = () => {
    const list = ResilienceService.getCrashReports();
    setReports(list);
    if (list.length > 5) {
      setSystemHealth('critical');
    } else if (list.length > 0) {
      setSystemHealth('degraded');
    } else {
      setSystemHealth('healthy');
    }
  };

  useEffect(() => {
    reload();
    // Poll logs occasionally
    const interval = setInterval(reload, 3000);
    return () => clearInterval(interval);
  }, []);

  const simulateSafeRecovery = (moduleName: string, message: string) => {
    ResilienceService.logCrash(moduleName, message);
    reload();
  };

  return {
    reports,
    systemHealth,
    simulateSafeRecovery,
    isOperational: systemHealth !== 'critical'
  };
}

export default useResilience;
