/**
 * React Hook: useOperationalAutomation
 * Exposes express shortcuts for common operational alerts, technician activities, and local inventory shortages.
 */

import { useCallback } from 'react';
import { useWorkflowEngine } from './useWorkflowEngine';

export function useOperationalAutomation() {
  const { triggerWorkflowManual, instances, metrics } = useWorkflowEngine();

  /**
   * Fires automation when a technician submits a complete sanitary application report
   */
  const triggerReportSubmitted = useCallback((serviceId: string, payload: {
    pestType: string;
    chemicalVolumeUsedStr: string;
    completedAt: string;
    technicianName: string;
  }) => {
    triggerWorkflowManual('event.operations.report_submitted', {
      serviceId,
      ...payload,
      timestamp: Date.now()
    });
  }, [triggerWorkflowManual]);

  /**
   * Fires automation when a warehouse item drops beneath the Safety Threshold Buffer
   */
  const triggerInventoryStarved = useCallback((itemId: string, itemName: string, currentVolume: number, minRequired: number) => {
    triggerWorkflowManual('event.operations.inventory_starved', {
      itemId,
      itemName,
      currentVolume,
      minRequired,
      deficit: minRequired - currentVolume,
      timestamp: Date.now()
    });
  }, [triggerWorkflowManual]);

  /**
   * Fires automation when a vehicle deviates or alerts of technical issues on road
   */
  const triggerEmergencyDeviation = useCallback((vehicleId: string, driverName: string, reasonDetails: string) => {
    triggerWorkflowManual('event.operations.route_deviation', {
      vehicleId,
      driverName,
      details: reasonDetails,
      severity: 'high',
      timestamp: Date.now()
    });
  }, [triggerWorkflowManual]);

  const activeOperationsJobs = instances.filter(
    i => i.payload.serviceId || i.payload.itemId || i.payload.vehicleId
  );

  return {
    triggerReportSubmitted,
    triggerInventoryStarved,
    triggerEmergencyDeviation,
    activeOperationsJobs,
    totalPreventedFailures: metrics?.failuresPreventedCount || 0
  };
}

export default useOperationalAutomation;
