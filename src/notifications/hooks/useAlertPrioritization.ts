/**
 * Custom React Hook: useAlertPrioritization
 * Exposes sorting and rank metrics directly to interface lists
 */

import { OperationalAlert } from '../types';
import { AlertPrioritizationEngine } from '../prioritization';

export function useAlertPrioritization() {
  const rankList = (alerts: OperationalAlert[]): OperationalAlert[] => {
    return AlertPrioritizationEngine.rankAlerts(alerts);
  };

  return {
    rankList
  };
}

export default useAlertPrioritization;
