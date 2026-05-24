/**
 * Hook: useIncidentDetection
 */

import { useState, useEffect } from 'react';
import { monitoringService } from '../services/monitoringService';
import { rollbackService } from '../services/rollbackService';
import { AppIncidentReport } from '../types';

export function useIncidentDetection() {
  const [incidents, setIncidents] = useState<AppIncidentReport[]>([]);

  const reloadIncidents = () => {
    setIncidents([...monitoringService.getIncidents()]);
  };

  useEffect(() => {
    reloadIncidents();
    // Simulate periodic checks
    const interval = setInterval(() => {
      reloadIncidents();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const triggerErrorSimulation = (msg: string, severity: AppIncidentReport['severity'] = 'error') => {
    const fresh = monitoringService.recordRuntimeError(msg, severity);
    reloadIncidents();
    return fresh;
  };

  const resolveIncidentLog = (id: string) => {
    monitoringService.resolveIncident(id);
    reloadIncidents();
  };

  const executeRollbackOfDeploy = (deploymentId: string, authorEmail: string) => {
    const outcome = rollbackService.triggerAutomaticRollback(deploymentId, authorEmail);
    reloadIncidents();
    return outcome;
  };

  return {
    incidents,
    triggerErrorSimulation,
    resolveIncidentLog,
    executeRollbackOfDeploy,
    criticalIncidentsCount: incidents.filter(i => !i.resolved && (i.severity === 'error' || i.severity === 'fatal')).length
  };
}
