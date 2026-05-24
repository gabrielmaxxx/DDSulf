/**
 * Custom React Hook: useOperationalAutomation
 * Focuses on pest control operations, field checklist actions, and emergency route deviations.
 */

import { useWorkflowEngine } from './useWorkflowEngine';

export function useOperationalAutomation() {
  const { triggerWorkflowManual, instances, metrics } = useWorkflowEngine();

  /**
   * Fires automation when technician finishes an application report
   */
  const triggerReportSubmitted = (serviceId: string, payload: {
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
  };

  /**
   * Triggers workflow when critical chemical inventory falls below minimum safety buffer limits
   */
  const triggerInventoryStarved = (itemId: string, itemName: string, currentVolume: number, minRequired: number) => {
    triggerWorkflowManual('event.operations.inventory_starved', {
      itemId,
      itemName,
      currentVolume,
      minRequired,
      deficit: minRequired - currentVolume,
      timestamp: Date.now()
    });
  };

  const activeOperationsJobs = instances.filter(
    i => i.payload.serviceId || i.payload.itemId
  );

  return {
    triggerReportSubmitted,
    triggerInventoryStarved,
    activeOperationsJobs,
    totalPreventedFailures: metrics?.failuresPreventedCount || 0
  };
}

export default useOperationalAutomation;
