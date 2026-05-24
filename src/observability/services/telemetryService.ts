/**
 * DDSulf Telemetry Service
 * Emits unified operational logs, tracks tenant context boundaries, and broadcasts real-time telemetry updates.
 */

import { OperationalTelemetryEvent, TelemetrySeverity, OperationalDomain } from '../types';

class TelemetryService {
  private events: OperationalTelemetryEvent[] = [];
  private onTelemetryLoggedListeners: ((event: OperationalTelemetryEvent) => void)[] = [];

  constructor() {
    this.seedBaselineTelemetry();
  }

  private seedBaselineTelemetry() {
    const defaultTenant = 'ddsulf_matriz';
    const defaultUser = 'gabriel_admin';
    const baseDate = new Date();

    this.events = [
      {
        id: 'evt_001',
        timestamp: new Date(baseDate.getTime() - 250000).toISOString(),
        domain: OperationalDomain.DATABASE,
        severity: TelemetrySeverity.INFO,
        tenantId: defaultTenant,
        userId: defaultUser,
        title: 'Query Otimizada com Sucesso',
        description: 'Passe de carregamento das listas de almoxarifado carregadas em cache RAM client-side.',
        metadata: { hitCount: 142, durationMs: 4 }
      },
      {
        id: 'evt_002',
        timestamp: new Date(baseDate.getTime() - 180000).toISOString(),
        domain: OperationalDomain.AI_RECOMMENDATION,
        severity: TelemetrySeverity.INFO,
        tenantId: defaultTenant,
        userId: defaultUser,
        title: 'Mapeamento Contextual Concluído',
        description: 'Engine do Gemini computou correlações históricas de infestações regionais em Caxias do Sul.',
        metadata: { model: 'gemini-2.5-flash', responseTimeMs: 450 }
      },
      {
        id: 'evt_003',
        timestamp: new Date(baseDate.getTime() - 120000).toISOString(),
        domain: OperationalDomain.REALTIME_SOCKET,
        severity: TelemetrySeverity.WARNING,
        tenantId: defaultTenant,
        userId: defaultUser,
        title: 'Reconexão de Socket Realtime',
        description: 'Interrupção temporária de conexões sincronizadas em dispositivo móvel com rede 3G.',
        metadata: { signalStrengthPct: 34, retryAttempt: 1 }
      }
    ];
  }

  public getEvents(domain?: OperationalDomain, severity?: TelemetrySeverity): OperationalTelemetryEvent[] {
    let filtered = [...this.events];
    if (domain) filtered = filtered.filter(e => e.domain === domain);
    if (severity) filtered = filtered.filter(e => e.severity === severity);
    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public logEvent(
    domain: OperationalDomain,
    severity: TelemetrySeverity,
    title: string,
    description: string,
    metadata?: Record<string, any>
  ): OperationalTelemetryEvent {
    const newEvent: OperationalTelemetryEvent = {
      id: `evt_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      domain,
      severity,
      tenantId: 'ddsulf_matriz',
      userId: 'gabriel_admin',
      title,
      description,
      metadata
    };

    // Cap storage limits for frontend stability
    if (this.events.length > 250) {
      this.events.shift();
    }

    this.events.push(newEvent);
    
    // Broadcast notification signal
    this.onTelemetryLoggedListeners.forEach(l => l(newEvent));
    return newEvent;
  }

  public subscribe(onLogged: (event: OperationalTelemetryEvent) => void): () => void {
    this.onTelemetryLoggedListeners.push(onLogged);
    return () => {
      this.onTelemetryLoggedListeners = this.onTelemetryLoggedListeners.filter(l => l !== onLogged);
    };
  }

  public clearAll(): void {
    this.events = [];
  }
}

export const telemetryService = new TelemetryService();
export default telemetryService;
