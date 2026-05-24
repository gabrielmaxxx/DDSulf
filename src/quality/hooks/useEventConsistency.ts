/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { consistencyService, ConsistencyIssue } from '../../integration/services/consistencyService';
import { eventBusService } from '../../integration/services/eventBusService';
import { OperationalEvent } from '../../integration/types';

export function useEventConsistency() {
  const [issues, setIssues] = useState<ConsistencyIssue[]>(() => consistencyService.getIssues());
  const [history, setHistory] = useState<OperationalEvent[]>(() => eventBusService.getHistory());
  const [isScanning, setIsScanning] = useState(false);

  const refreshState = useCallback(() => {
    setIssues([...consistencyService.getIssues()]);
    setHistory([...eventBusService.getHistory()]);
  }, []);

  const triggerReconciliationScan = useCallback(async () => {
    setIsScanning(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    consistencyService.runFullReconciliationScan();
    setIsScanning(false);
    refreshState();
  }, [refreshState]);

  const resolveConsistencyIssue = useCallback((id: string) => {
    consistencyService.resolveIssue(id);
    refreshState();
  }, [refreshState]);

  const replayEventTrace = useCallback(async (event: OperationalEvent) => {
    // Event replay triggers republishing with new trace header
    const correlationId = `replay_${Date.now()}_${event.correlationId.substring(0, 8)}`;
    await eventBusService.publish(
      event.eventName,
      event.payload,
      event.sourceModule,
      correlationId
    );
    refreshState();
  }, [refreshState]);

  useEffect(() => {
    // Set periodic status check to match live changes
    const timer = setInterval(() => {
      refreshState();
    }, 1500);
    return () => clearInterval(timer);
  }, [refreshState]);

  return {
    issues,
    history,
    isScanning,
    triggerReconciliationScan,
    resolveConsistencyIssue,
    replayEventTrace,
    refreshState
  };
}
export default useEventConsistency;
