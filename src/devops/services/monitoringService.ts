/**
 * DDSulf Diagnostic Monitoring and Incident capture engine
 */

import { AppIncidentReport } from '../types';

class MonitoringService {
  private runtimeIncidents: AppIncidentReport[] = [];

  constructor() {
    this.seedDefaultIncidents();
  }

  private seedDefaultIncidents() {
    this.runtimeIncidents = [
      {
        id: 'inc_b10',
        severity: 'warning',
        message: 'Atraso na liberação de cache imobilizado do ServiceWorker no iOS 17.1',
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
        resolved: true,
        tenantId: 'ddsulf_matriz'
      },
      {
        id: 'inc_b11',
        severity: 'error',
        message: 'Falha intermitente na requisição de API com o Gateway de Pagamentos',
        stackTrace: 'Error: Connection Timeout after 15000ms\n  at fetchWithRetry (src/lib/network.ts:24)\n  at submitBilling (src/modules/financial/billing.ts:109)',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        resolved: false,
        tenantId: 'ddsulf_matriz'
      }
    ];
  }

  public getIncidents(): AppIncidentReport[] {
    return this.runtimeIncidents;
  }

  public recordRuntimeError(message: string, severity: AppIncidentReport['severity'] = 'error', stack?: string, tenantId?: string): AppIncidentReport {
    const errorLog: AppIncidentReport = {
      id: `err_${Math.floor(1000 + Math.random() * 9000)}`,
      severity,
      message,
      stackTrace: stack || new Error().stack,
      timestamp: new Date().toISOString(),
      resolved: false,
      tenantId
    };
    this.runtimeIncidents.unshift(errorLog);
    return errorLog;
  }

  public resolveIncident(id: string) {
    const matched = this.runtimeIncidents.find(i => i.id === id);
    if (matched) {
      matched.resolved = true;
    }
  }
}

export const monitoringService = new MonitoringService();
export default monitoringService;
