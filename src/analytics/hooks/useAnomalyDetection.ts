/**
 * Hook: useAnomalyDetection
 * Integrates real-time anomaly log scanning, manual injections, and direct decision links.
 */

import { useState } from 'react';
import { anomalyDetectionService, OperationalAnomaly } from '../services/anomalyDetectionService';

export function useAnomalyDetection() {
  const [anomalies, setAnomalies] = useState<OperationalAnomaly[]>(() =>
    anomalyDetectionService.getActiveAnomalies()
  );

  const runSystemScan = () => {
    const freshList = anomalyDetectionService.runAutomatedScan();
    setAnomalies(freshList);
  };

  const forceInjectAnomaly = (
    metricKey: string,
    source: string,
    recordedValue: number,
    expectedLimit: number,
    severity: 'low' | 'medium' | 'critical',
    remedyAction: string
  ) => {
    anomalyDetectionService.injectTechnicalOutlier(metricKey, source, recordedValue, expectedLimit, severity, remedyAction);
    setAnomalies(anomalyDetectionService.getActiveAnomalies());
  };

  return {
    anomalies,
    criticalAnomaliesCount: anomalies.filter(a => a.severity === 'critical').length,
    runSystemScan,
    forceInjectAnomaly
  };
}
