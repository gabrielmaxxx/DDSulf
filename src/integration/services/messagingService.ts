/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { SystemModuleName, OperationalEvent, OperationalEventType } from '../types';
import { eventBusService } from './eventBusService';
import { tenantStorage } from '@/utils/storage';

export interface InternalMessage {
  id: string;
  timestamp: number;
  sender: SystemModuleName;
  recipient: SystemModuleName | 'all';
  subject: string;
  body: string;
  read: boolean;
  alertLevel: 'low' | 'medium' | 'high' | 'critical';
  correlationId: string;
}

const MESSAGING_STORAGE_KEY = 'messaging_internal';

export class MessagingService {
  private messages: InternalMessage[] = [];

  constructor() {
    this.restoreMessages();
    this.registerMessagingTriggers();
  }

  private restoreMessages() {
    try {
      const saved = tenantStorage.getItem(MESSAGING_STORAGE_KEY);
      if (saved) {
        this.messages = JSON.parse(saved);
      } else {
        this.messages = [
          {
            id: 'msg_01',
            timestamp: Date.now() - 14400000,
            sender: SystemModuleName.STOCK,
            recipient: 'all',
            subject: 'Estoque Crítico de Piretróides',
            body: 'Aviso de baixa volumetria de Piretróide de aspersão rápida na filial Pelotas-Sul.',
            read: false,
            alertLevel: 'high',
            correlationId: 'corr_stock_01'
          },
          {
            id: 'msg_02',
            timestamp: Date.now() - 3600000,
            sender: SystemModuleName.POPS,
            recipient: 'all',
            subject: 'Laudo Sanitário Novo Emitido',
            body: 'Laudo técnico com calibração estequiométrica gravado com autenticação biométrica.',
            read: true,
            alertLevel: 'low',
            correlationId: 'corr_pop_02'
          }
        ];
        this.persist();
      }
    } catch {
      // offline silent
    }
  }

  private persist() {
    try {
      tenantStorage.setItem(MESSAGING_STORAGE_KEY, JSON.stringify(this.messages));
    } catch (e) {
      console.warn('Internal messages save error:', e);
    }
  }

  private registerMessagingTriggers() {
    // Notify low stock on telemetry or related events
    eventBusService.subscribe(OperationalEventType.STOCK_LOW, (event) => {
      this.dispatchInternalMessage(
        SystemModuleName.STOCK,
        'all',
        'ALERTA: Margem de Segurança Estourada',
        `Nível de defensivo residual de ${event.payload.item} está abaixo do limite estequiométrico seguro para aspersão.`,
        'critical',
        event.correlationId
      );
    });

    // Notify of calculation anomalies
    eventBusService.subscribe(OperationalEventType.AI_ANOMALY_DETECTED, (event) => {
      this.dispatchInternalMessage(
        SystemModuleName.AI,
        'all',
        'DDSulf CoPilot: Anomalia Rastreável',
        `A Inteligência Artificial identificou um padrão atípico de volatilidade residual: ${event.payload.description}.`,
        'high',
        event.correlationId
      );
    });
  }

  public getMessages(): InternalMessage[] {
    return this.messages;
  }

  public dispatchInternalMessage(
    sender: SystemModuleName,
    recipient: SystemModuleName | 'all',
    subject: string,
    body: string,
    alertLevel: InternalMessage['alertLevel'],
    correlationId: string
  ): InternalMessage {
    const fresh: InternalMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      timestamp: Date.now(),
      sender,
      recipient,
      subject,
      body,
      read: false,
      alertLevel,
      correlationId
    };

    this.messages.unshift(fresh);
    this.persist();

    eventBusService.logTelemetry(
      'info',
      sender,
      `Mensageria interna despachou alerta para modulo [${recipient}]: ${subject}`,
      correlationId
    );

    return fresh;
  }

  public markAsRead(id: string) {
    const msg = this.messages.find(m => m.id === id);
    if (msg) {
      msg.read = true;
      this.persist();
    }
  }

  public clearAll() {
    this.messages = [];
    this.persist();
  }
}

export const messagingService = new MessagingService();
export default messagingService;
