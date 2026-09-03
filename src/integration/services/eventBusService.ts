/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { OperationalEvent, OperationalEventType, SystemModuleName, IntegrationLog } from '../types';
import { db, auth } from '@/services/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs,
  onSnapshot, 
  query, 
  where,
  orderBy, 
  limit 
} from 'firebase/firestore';
import { useSystemStore } from '@/store/systemStore';
import { toast } from 'sonner';
import { tenantStorage } from '@/utils/storage';

type EventListenerCallback = (event: OperationalEvent) => void | Promise<void>;

const EVENTS_LOCAL_STORAGE = 'integration_events';
const QUEUE_LOCAL_STORAGE = 'integration_offline_queue';
const TELEMETRY_LOCAL_STORAGE = 'integration_telemetry';

export class EventBusService {
  private listeners: Map<OperationalEventType, Set<EventListenerCallback>> = new Map();
  private eventHistory: OperationalEvent[] = [];
  private offlineQueue: OperationalEvent[] = [];
  private telemetryLogs: IntegrationLog[] = [];
  private currentTenantId: string = 'tenant_porto_alegre_01';
  private processedEventIds: Set<string> = new Set();
  private startTimestamp: number = Date.now();
  private isListeningToRealtime: boolean = false;

  constructor() {
    this.restoreState();
    this.fetchFirestoreEvents();
    this.initRealtimeFirestoreListener();
  }

  private restoreState() {
    try {
      const savedEvents = tenantStorage.getItem(EVENTS_LOCAL_STORAGE);
      if (savedEvents) {
        this.eventHistory = JSON.parse(savedEvents);
      }

      const savedQueue = tenantStorage.getItem(QUEUE_LOCAL_STORAGE);
      if (savedQueue) {
        this.offlineQueue = JSON.parse(savedQueue);
      }

      const savedLogs = tenantStorage.getItem(TELEMETRY_LOCAL_STORAGE);
      if (savedLogs) {
        this.telemetryLogs = JSON.parse(savedLogs);
      } else {
        this.telemetryLogs = [
          {
            id: 'log_001',
            timestamp: Date.now() - 3600000,
            type: 'info',
            module: SystemModuleName.INTEGRATION,
            message: 'Barramento de eventos corporativo Firebase inicializado (PestFlow Enterprise Fabric).',
            correlationId: 'corr_init_default'
          }
        ];
        this.persistTelemetry();
      }
    } catch {
      // offline silent fallback
    }
  }

  private async fetchFirestoreEvents() {
    try {
      const eventsCol = collection(db, 'events');
      const q = query(eventsCol, orderBy('timestamp', 'desc'), limit(50));
      const querySnapshot = await getDocs(q);
      
      const loadedEvents: OperationalEvent[] = [];
      querySnapshot.forEach((doc) => {
        const item = doc.data() as any;
        loadedEvents.push({
          id: item.id || doc.id,
          eventName: item.eventName,
          version: item.version || '1.2.0',
          sourceModule: item.sourceModule || SystemModuleName.INTEGRATION,
          tenantId: item.tenantId || this.currentTenantId,
          payload: item.payload || {},
          timestamp: item.timestamp || Date.now(),
          origin: item.origin || 'client_online',
          correlationId: item.correlationId || 'corr_fetched',
          traceParent: item.traceParent,
          date: item.date,
          time: item.time,
          user: item.user
        });
        
        this.processedEventIds.add(item.id || doc.id);
      });

      if (loadedEvents.length > 0) {
        this.eventHistory = loadedEvents;
        this.persistEvents();
      }
    } catch (err) {
      console.warn('[EventBus] Could not fetch initial events history from Firestore:', err);
    }
  }

  private initRealtimeFirestoreListener() {
    if (this.isListeningToRealtime) return;

    try {
      const eventsCol = collection(db, 'events');
      // Subscriação em tempo real aos novos eventos apenas (tempo de sessão)
      const q = query(
        eventsCol, 
        where('timestamp', '>=', this.startTimestamp - 5000), 
        orderBy('timestamp', 'asc')
      );

      onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const data = change.doc.data() as any;
            const eventId = data.id || change.doc.id;

            // Evitar duplicar processamento local
            if (!this.processedEventIds.has(eventId)) {
              this.processedEventIds.add(eventId);

              const newEvent: OperationalEvent = {
                id: eventId,
                eventName: data.eventName,
                version: data.version || '1.2.0',
                sourceModule: data.sourceModule || SystemModuleName.INTEGRATION,
                tenantId: data.tenantId || this.currentTenantId,
                payload: data.payload || {},
                timestamp: data.timestamp || Date.now(),
                origin: data.origin || 'client_online',
                correlationId: data.correlationId || 'corr_realtime',
                traceParent: data.traceParent,
                date: data.date,
                time: data.time,
                user: data.user
              };

              // Logar em memória local
              const exists = this.eventHistory.some(e => e.id === eventId);
              if (!exists) {
                this.eventHistory.unshift(newEvent);
                this.persistEvents();
              }

              // Executar ações do orquestrador de negócios automático (Listeners)
              this.executeAutomaticListeners(newEvent);

              // Disparar listeners de callbacks registrados na interface
              this.dispatchToListeners(newEvent);
            }
          }
        });
      }, (error) => {
        console.warn('[EventBus] Realtime subscription feedback warning:', error);
      });

      this.isListeningToRealtime = true;
    } catch (e) {
      console.error('[EventBus] Failed to initialize Firestore snapshot sync:', e);
    }
  }

  private async executeAutomaticListeners(event: OperationalEvent) {
    const { eventName, payload } = event;
    const store = useSystemStore.getState();

    switch (eventName) {
      case 'ORCAMENTO_APROVADO': {
        const quoteId = payload.quoteId || payload.id;
        if (!quoteId) return;

        store.updateQuoteStatus(quoteId, 'aprovado');

        this.logTelemetry(
          'info',
          SystemModuleName.INTEGRATION,
          `Workflow [ORCAMENTO_APROVADO] processado: Status do orçamento atualizado para aprovado.`,
          event.correlationId
        );
        break;
      }

      case 'OS_CONCLUIDA': {
        const quoteId = payload.quoteId || payload.id;
        if (!quoteId) return;

        const quote = store.quotes.list.find((q: any) => q.id === quoteId);
        
        // 1. Confirmar serviço executado no store (deduz estoque e lança receita correspondente do OS)
        if (quote && quote.status !== 'executado') {
          store.confirmServiceExecuted(quoteId, payload.confirmedBy || 'Técnico Responsável', payload.serviceNotes || 'Concluído via evento');
        }

        // 2. Agendar retorno gratuito baseado no tipo de praga (Garantia)
        let warrantyDays = 90;
        const pType = quote?.service?.pestType?.toLowerCase() || '';
        if (pType.includes('rato') || pType.includes('roedor')) {
          warrantyDays = 15;
        } else if (pType.includes('cupim') || pType.includes('madeira')) {
          warrantyDays = 365;
        } else if (pType.includes('barata')) {
          warrantyDays = 90;
        }
        
        const warrantyDate = new Date();
        warrantyDate.setDate(warrantyDate.getDate() + warrantyDays);
        const warrantyDateStr = warrantyDate.toISOString().split('T')[0];

        const retornoExists = store.agenda.some((item: any) => item.quoteId === quoteId && item.type === 'retorno');
        if (!retornoExists) {
          store.addAgendaEvent({
            id: `ev-ret-${Math.random().toString(36).substring(2, 11)}`,
            title: `Retorno Garantia - OS #${quoteId} (${quote?.client?.name || payload.clientName || 'Cliente'})`,
            date: warrantyDateStr,
            clientId: payload.clientId || '',
            clientName: quote?.client?.name || payload.clientName || 'Cliente',
            type: 'retorno',
            quoteId: quoteId,
            notes: `Garantia de ${warrantyDays} dias para o controle de ${quote?.service?.pestType || 'pragas'}.`,
            status: 'pendente'
          });
        }

        this.logTelemetry(
          'info',
          SystemModuleName.INTEGRATION,
          `Workflow [OS_CONCLUIDA] processado: Estoque reduzido, recebimento financeiro confirmado e retorno agendado.`,
          event.correlationId
        );
        break;
      }

      case 'ESTOQUE_MINIMO_ATINGIDO': {
        const { productId, productName, currentQuantity, minQuantity } = payload;
        if (!productId) return;

        // 1. Criar Solicitação de Compra
        const alreadyRequested = store.purchases.some(
          (req: any) => req.productId === productId && req.status === 'Pendente'
        );
        if (!alreadyRequested) {
          store.addPurchaseRequisition({
            id: `purch-${Math.random().toString(36).substring(2, 11)}`,
            productId: productId,
            productName: productName || 'Produto químico',
            currentStock: currentQuantity ?? 0,
            minStock: minQuantity ?? 10,
            idealStock: (minQuantity ?? 10) * 2.5,
            quantityToBuy: ((minQuantity ?? 10) * 2.5) - (currentQuantity ?? 0),
            status: 'Pendente',
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString()
          });
        }

        // 2. Exiber Alerta na tela
        toast.warning(`⚠️ Alerta de Estoque: O produto "${productName}" atingiu o estoque mínimo de ${minQuantity}!`);

        this.logTelemetry(
          'warning',
          SystemModuleName.INTEGRATION,
          `Workflow [ESTOQUE_MINIMO_ATINGIDO] para "${productName}": Solicitação de compra pendente gerada.`,
          event.correlationId
        );
        break;
      }

      case 'CONTRATO_VENCENDO': {
        const { clientName, title, endDate } = payload;
        
        // 1. Criar Tarefa Comercial no calendário
        store.addAgendaEvent({
          id: `ev-tsk-${Math.random().toString(36).substring(2, 11)}`,
          title: `Tarefa Comercial: Renovar Contrato (${clientName || 'Cliente'})`,
          date: new Date().toISOString().split('T')[0],
          clientName: clientName || 'Cliente',
          type: 'outro',
          notes: `Contrato "${title || 'Mensal'}" está prestes a expirar em ${endDate || 'breve'}. Contato comercial necessário!`,
          status: 'pendente'
        });

        // 2. Exibir Alerta na interface
        toast.error(`🔔 Contrato Vencendo: O contrato "${title || 'Mensal'}" de ${clientName || 'Cliente'} vence em ${endDate}!`);

        this.logTelemetry(
          'info',
          SystemModuleName.INTEGRATION,
          `Workflow [CONTRATO_VENCENDO] para comerciário: Alerta e tarefa de renovação criados no calendário.`,
          event.correlationId
        );
        break;
      }

      default:
        break;
    }
  }

  private persistEvents() {
    try {
      tenantStorage.setItem(EVENTS_LOCAL_STORAGE, JSON.stringify(this.eventHistory.slice(0, 100)));
    } catch (e) {
      // transient silent fail
    }
  }

  private persistQueue() {
    try {
      tenantStorage.setItem(QUEUE_LOCAL_STORAGE, JSON.stringify(this.offlineQueue));
    } catch (e) {
      console.error(e);
    }
  }

  private persistTelemetry() {
    try {
      tenantStorage.setItem(TELEMETRY_LOCAL_STORAGE, JSON.stringify(this.telemetryLogs.slice(0, 100)));
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
    const eventId = `ev_${Date.now()}_${Math.random().toString(36).substring(6)}`;
    const dateObj = new Date();

    const event: OperationalEvent = {
      id: eventId,
      eventName,
      version: '1.2.0',
      sourceModule,
      tenantId: this.currentTenantId,
      payload: payload || {},
      timestamp: Date.now(),
      origin: isOnline ? 'client_online' : 'client_offline',
      correlationId,
      traceParent: `00-${correlationId}-01`,
      date: dateObj.toLocaleDateString('pt-BR'),
      time: dateObj.toLocaleTimeString('pt-BR'),
      user: auth.currentUser?.email || auth.currentUser?.uid || 'Colaborador PestFlow'
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

      // Adicionar aos eventos processados localmente para não disparar novamente via onSnapshot de si mesmo
      this.processedEventIds.add(eventId);

      // Salvar na coleção Firebase "events" para Auditoria e Integração
      try {
        const eventDocRef = doc(db, 'events', eventId);
        await setDoc(eventDocRef, {
          id: eventId,
          eventName,
          version: event.version,
          sourceModule,
          tenantId: event.tenantId,
          payload: event.payload,
          timestamp: event.timestamp,
          origin: event.origin,
          correlationId,
          traceParent: event.traceParent,
          date: event.date,
          time: event.time,
          user: event.user
        });
      } catch (err) {
        console.error('[EventBus] Failed to publish event to database, falling back to memory listeners:', err);
      }

      // Executar ações do orquestrador de negócios na sessão local
      await this.executeAutomaticListeners(event);

      // Distribuir para listeners de tela registados na sessão local
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
      this.processedEventIds.add(event.id);

      // Salvar no Firebase
      try {
        const eventDocRef = doc(db, 'events', event.id);
        await setDoc(eventDocRef, {
          id: event.id,
          eventName: event.eventName,
          version: event.version,
          sourceModule: event.sourceModule,
          tenantId: event.tenantId,
          payload: event.payload,
          timestamp: event.timestamp,
          origin: event.origin,
          correlationId: event.correlationId,
          traceParent: event.traceParent,
          date: event.date,
          time: event.time,
          user: event.user
        });
      } catch (e) {
        console.error('[EventBus] Failed syncing offline event to Firebase:', e);
      }

      await this.executeAutomaticListeners(event);
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
    this.processedEventIds.clear();
    tenantStorage.removeItem(EVENTS_LOCAL_STORAGE);
    tenantStorage.removeItem(QUEUE_LOCAL_STORAGE);
    tenantStorage.removeItem(TELEMETRY_LOCAL_STORAGE);
    this.logTelemetry('info', SystemModuleName.INTEGRATION, 'Fabric states limpos e reinicializados.', 'corr_clear');
  }
}

export const eventBusService = new EventBusService();
export default eventBusService;
