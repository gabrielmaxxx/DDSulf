/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { OperationalEvent, OperationalEventType, SystemModuleName, IntegrationLog } from '../types';

type EventListenerCallback = (event: OperationalEvent) => void | Promise<void>;

const EVENTS_LOCAL_STORAGE = 'ddsulf_integration_events';
const QUEUE_LOCAL_STORAGE = 'ddsulf_integration_offline_queue';
const TELEMETRY_LOCAL_STORAGE = 'ddsulf_integration_telemetry';

export class EventBusService {
  private listeners: Map<OperationalEventType, Set<EventListenerCallback>> = new Map();
  private eventHistory: OperationalEvent[] = [];
  private offlineQueue: OperationalEvent[] = [];
  private telemetryLogs: IntegrationLog[] = [];
  private currentTenantId: string = 'tenant_porto_alegre_01';

  constructor() {
    this.restoreState();
  }

  private restoreState() {
    try {
      const savedEvents = localStorage.getItem(EVENTS_LOCAL_STORAGE);
      if (savedEvents) {
        this.eventHistory = JSON.parse(savedEvents);
      }

      const savedQueue = localStorage.getItem(QUEUE_LOCAL_STORAGE);
      if (savedQueue) {
        this.offlineQueue = JSON.parse(savedQueue);
      }

      const savedLogs = localStorage.getItem(TELEMETRY_LOCAL_STORAGE);
      if (savedLogs) {
        this.telemetryLogs = JSON.parse(savedLogs);
      } else {
        this.telemetryLogs = [
          {
            id: 'log_001',
            timestamp: Date.now() - 3600000,
            type: 'info',
            module: SystemModuleName.INTEGRATION,
            message: 'Barramento de eventos corporativo inicializado (DDSulf Enterprise Fabric).',
            correlationId: 'corr_init_default'
          }
        ];
        this.persistTelemetry();
      }
    } catch {
      // offline silent fallback
    }
  }

  private persistEvents() {
    try {
      localStorage.setItem(EVENTS_LOCAL_STORAGE, JSON.stringify(this.eventHistory.slice(0, 100)));
    } catch (e) {
      console.warn('Failed to persist integration events:', e);
    }
  }

  private persistQueue() {
    try {
      localStorage.setItem(QUEUE_LOCAL_STORAGE, JSON.stringify(this.offlineQueue));
    } catch (e) {
      console.error(e);
    }
  }

  private persistTelemetry() {
    try {
      localStorage.setItem(TELEMETRY_LOCAL_STORAGE, JSON.stringify(this.telemetryLogs.slice(0, 100)));
    } catch (e) {
      console.error(e);
    }
  }

  public getTenantId(): string {
    return this.currentTenantId;
  }

  public changeTenantContext(newTenant: string) {
    this.currentTenantId = newTenant;
    this.logTelemetry('info', SystemModuleName.INTEGRATION, `Contexto de Tenant redefinido para: ${newTenant}`, 'corr_tenant_shift');
  }

  public subscribe(eventType: OperationalEventType, callback: EventListenerCallback): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);
    return () => {
      this.listeners.get(eventType)?.delete(callback);
    };
  }

  public async publish(
    eventName: OperationalEventType,
    payload: any,
    sourceModule: SystemModuleName,
    correlationId: string = `corr_${Math.random().toString(36).substring(4)}`
  ): Promise<OperationalEvent> {
    const isOnline = navigator.onLine;

    const event: OperationalEvent = {
      id: `ev_${Date.now()}_${Math.random().toString(36).substring(6)}`,
      eventName,
      version: '1.2.0',
      sourceModule,
      tenantId: this.currentTenantId,
      payload,
      timestamp: Date.now(),
      origin: isOnline ? 'client_online' : 'client_offline',
      correlationId,
      traceParent: `00-${correlationId}-01`
    };

    if (!isOnline) {
      // Queued offline
      this.offlineQueue.push(event);
      this.persistQueue();
      this.logTelemetry(
        'warning', 
        sourceModule, 
        `Rede indisponível. Evento "${eventName}" enfileirado offline.`, 
        correlationId
      );
    } else {
      // Inline storage
      this.eventHistory.unshift(event);
      this.persistEvents();
      this.logTelemetry(
        'info', 
        sourceModule, 
        `Evento "${eventName}" publicado com sucesso online.`, 
        correlationId
      );

      // Distribute to local memory subscribers
      this.dispatchToListeners(event);
    }

    return event;
  }

  private async dispatchToListeners(event: OperationalEvent) {
    const callbacks = this.listeners.get(event.eventName);
    if (callbacks) {
      for (const cb of callbacks) {
        try {
          await cb(event);
        } catch (err: any) {
          this.logTelemetry(
            'error',
            SystemModuleName.INTEGRATION,
            `Falha na callback do listener para ${event.eventName}: ${err?.message || err}`,
            event.correlationId
          );
        }
      }
    }
  }

  public getHistory(): OperationalEvent[] {
    return this.eventHistory;
  }

  public getOfflineQueue(): OperationalEvent[] {
    return this.offlineQueue;
  }

  public getTelemetryLogs(): IntegrationLog[] {
    return this.telemetryLogs;
  }

  public logTelemetry(type: 'info' | 'warning' | 'error', module: SystemModuleName, message: string, correlationId: string) {
    const log: IntegrationLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      timestamp: Date.now(),
      type,
      module,
      message,
      correlationId
    };
    this.telemetryLogs.unshift(log);
    this.persistTelemetry();
  }

  public async syncOfflineWorkroom(): Promise<{ syncedCount: number; resolvedConflicts: boolean }> {
    if (this.offlineQueue.length === 0) {
      return { syncedCount: 0, resolvedConflicts: false };
    }

    const count = this.offlineQueue.length;
    const items = [...this.offlineQueue];
    this.offlineQueue = [];
    this.persistQueue();

    // Replay queued events
    for (const event of items) {
      event.origin = 'client_online';
      event.timestamp = Date.now(); // update time index
      this.eventHistory.unshift(event);
      this.dispatchToListeners(event);
    }

    this.persistEvents();
    this.logTelemetry(
      'info',
      SystemModuleName.INTEGRATION,
      `Orquestrador ressicronizou ${count} eventos retidos da fila offline com sucesso.`,
      `corr_sync_${Date.now()}`
    );

    return { syncedCount: count, resolvedConflicts: true };
  }

  public clearStorage() {
    this.eventHistory = [];
    this.offlineQueue = [];
    this.telemetryLogs = [];
    localStorage.removeItem(EVENTS_LOCAL_STORAGE);
    localStorage.removeItem(QUEUE_LOCAL_STORAGE);
    localStorage.removeItem(TELEMETRY_LOCAL_STORAGE);
    this.logTelemetry('info', SystemModuleName.INTEGRATION, 'Fabric states limpos e reinicializados.', 'corr_clear');
  }
}

export const eventBusService = new EventBusService();
export default eventBusService;
