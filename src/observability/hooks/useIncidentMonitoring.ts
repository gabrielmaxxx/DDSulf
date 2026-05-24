/**
 * Hook: useIncidentMonitoring
 * Monitors real-time anomalies and allows resolution of open service incidents.
 */

import { useState } from 'react';
import { incidentService } from '../services';
import { SystemIncident, OperationalDomain, TelemetrySeverity } from '../types';

export function useIncidentMonitoring() {
  const [incidents, setIncidents] = useState<SystemIncident[]>(() => incidentService.getIncidents());

  const logFailureIncident = (
    domain: OperationalDomain,
    severity: TelemetrySeverity,
    title: string,
    description: string,
    impact: number = 30
  ) => {
    incidentService.reportIncident(domain, severity, title, description, impact);
    setIncidents(incidentService.getIncidents());
  };

  const resolveActiveIncident = (id: string) => {
    incidentService.resolveIncident(id);
    setIncidents(incidentService.getIncidents());
  };

  return {
    incidents,
    unresolvedIncidents: incidents.filter(i => i.status === 'unresolved'),
    resolvedIncidents: incidents.filter(i => i.status === 'resolved'),
    logFailureIncident,
    resolveActiveIncident,
    clearAllIncidents: () => {
      incidentService.clearAll();
      setIncidents([]);
    }
  };
}
