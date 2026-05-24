/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';
import { consistencyService, ConsistencyIssue } from '../services/consistencyService';

export function useConsistencyValidation() {
  const [issues, setIssues] = useState<ConsistencyIssue[]>(() => consistencyService.getIssues());
  const [scanning, setScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<{ details: string; count: number } | null>(null);

  const refreshIssues = useCallback(() => {
    setIssues([...consistencyService.getIssues()]);
  }, []);

  const resolveIssue = useCallback((id: string) => {
    consistencyService.resolveIssue(id);
    refreshIssues();
  }, [refreshIssues]);

  const runReconciliation = useCallback(async () => {
    setScanning(true);
    setScanResult(null);

    // Realistic UI scanning simulation delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const result = consistencyService.runFullReconciliationScan();
    setScanResult({
      details: result.scanDetails,
      count: result.inconsistenciesFound
    });
    setScanning(false);
    refreshIssues();
  }, [refreshIssues]);

  return {
    issues,
    scanning,
    scanResult,
    resolveIssue,
    runReconciliation
  };
}
export default useConsistencyValidation;
