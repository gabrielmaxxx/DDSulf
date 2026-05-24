/**
 * DDSulf Operational Incident & Anomaly Detection Service
 * Allows engineers to raise unexpected failures, tracks anomaly timelines, and handles alert notifications.
 */

import { SystemIncident, OperationalDomain, TelemetrySeverity } from '../types';

class IncidentService {
  private activeIncidents: SystemIncident[] = [];
  private resolvedIncidents: SystemIncident[] = [];

  constructor() {
    this.seedBaselineIncidents();
  }

  private seedBaselineIncidents() {
    this.activeIncidents = [
      {
        id: 'inc_101',
        detectedAt: new Date(Date.now() - 300000).toISOString(),
        domain: OperationalDomain.REALTIME_SOCKET,
        severity: TelemetrySeverity.WARNING,
        title: 'Degradação Temporária de Latência',
        description: 'Técnicos rurais reportaram picos de 120ms na transmissão dos pacotes de agendamentos.',
        impactScore: 24,
        status: 'unresolved'
      }
    ];
  }

  public getIncidents(status: 'unresolved' | 'resolved' | 'all' = 'all'): SystemIncident[] {
    if (status === 'unresolved') return [...this.activeIncidents];
    if (status === 'resolved') return [...this.resolvedIncidents];
    return [...this.activeIncidents, ...this.resolvedIncidents];
  }

  /**
   * Registers a fresh operational incident and triggers alerting signals
   */
  public reportIncident(
    domain: OperationalDomain,
    severity: TelemetrySeverity,
    title: string,
    description: string,
    impact: number = 30
  ): SystemIncident {
    const rawIncident: SystemIncident = {
      id: `inc_${Math.random().toString(36).substr(2, 9)}`,
      detectedAt: new Date().toISOString(),
      domain,
      severity,
      title,
      description,
      impactScore: Math.max(0, Math.min(100, impact)),
      status: 'unresolved'
    };

    this.activeIncidents.push(rawIncident);
    return rawIncident;
  }

  /**
   * Safe resolves an active incident and populates historical timelines
   */
  public resolveIncident(id: string): boolean {
    const origIdx = this.activeIncidents.findIndex(inc => inc.id === id);
    if (origIdx === -1) return false;

    const matched = this.activeIncidents[origIdx];
    matched.status = 'resolved';
    matched.resolvedAt = new Date().toISOString();

    this.activeIncidents.splice(origIdx, 1);
    this.resolvedIncidents.push(matched);
    return true;
  }

  public clearAll() {
    this.activeIncidents = [];
    this.resolvedIncidents = [];
  }
}

export const incidentService = new IncidentService();
export default incidentService;
