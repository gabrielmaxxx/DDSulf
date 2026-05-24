/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { OperationalEvent, SystemModuleName } from '../types';
import { eventBusService } from './eventBusService';

export interface ConsistencyIssue {
  id: string;
  timestamp: number;
  type: 'duplicate' | 'out_of_order' | 'contract_violation' | 'orphaned_correlation';
  description: string;
  targetEventId?: string;
  resolved: boolean;
}

export class ConsistencyService {
  private issues: ConsistencyIssue[] = [];

  constructor() {
    this.restoreConsistencyState();
  }

  private restoreConsistencyState() {
    this.issues = [
      {
        id: 'iss_01',
        timestamp: Date.now() - 7200000,
        type: 'contract_violation',
        description: 'Assinatura inválida detectada no payload do evento "pop.saved_anvisa" da regional Sul.',
        targetEventId: 'ev_mock_old_01',
        resolved: true
      },
      {
        id: 'iss_02',
        timestamp: Date.now() - 1800000,
        type: 'orphaned_correlation',
        description: 'Fatura financeira sem evento de calculadora estequiométrica correspondente.',
        resolved: false
      }
    ];
  }

  public getIssues(): ConsistencyIssue[] {
    return this.issues;
  }

  public validateEventContract(event: OperationalEvent): boolean {
    const correlationId = event.correlationId;
    
    // Contract check: correlationId is present
    if (!correlationId || correlationId.trim() === '') {
      this.reportIssue('orphaned_correlation', `Evento sem ID de correlação para rastreabilidade de ponta a ponta. Evento ID: ${event.id}`, event.id);
      return false;
    }

    // Versioning contract
    if (!event.version || event.version !== '1.2.0') {
      this.reportIssue('contract_violation', `Versionamento incorreto do contrato recebido: "${event.version}". Esperado 1.2.0`, event.id);
      return false;
    }

    // Ensure state isolation (multi-tenant)
    if (!event.tenantId || !event.tenantId.startsWith('tenant_')) {
      this.reportIssue('contract_violation', `Falta de isolamento organizacional estrito de multi-tenant em evento: ${event.eventName}`, event.id);
      return false;
    }

    // Check duplicate
    const duplicates = eventBusService.getHistory().filter(e => e.id === event.id);
    if (duplicates.length > 1) {
      this.reportIssue('duplicate', `Duplicidade detectada de ID de evento: ${event.id}`, event.id);
      return false;
    }

    return true;
  }

  private reportIssue(type: ConsistencyIssue['type'], description: string, targetEventId?: string) {
    const isAlreadyReported = this.issues.some(i => i.type === type && i.targetEventId === targetEventId && !i.resolved);
    if (isAlreadyReported) return;

    const issue: ConsistencyIssue = {
      id: `iss_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      timestamp: Date.now(),
      type,
      description,
      targetEventId,
      resolved: false
    };

    this.issues.unshift(issue);
    eventBusService.logTelemetry(
      'error',
      SystemModuleName.INTEGRATION,
      `[Consistência] ${description}`,
      'corr_consistency_checker'
    );
  }

  public resolveIssue(id: string) {
    const issue = this.issues.find(i => i.id === id);
    if (issue) {
      issue.resolved = true;
      eventBusService.logTelemetry(
        'info',
        SystemModuleName.INTEGRATION,
        `Fratura de integridade do fabric resolvida: "${issue.description}"`,
        'corr_reconciliation'
      );
    }
  }

  public runFullReconciliationScan(): { scanDetails: string; inconsistenciesFound: number } {
    const history = eventBusService.getHistory();
    let anomalies = 0;

    history.forEach(ev => {
      const isValid = this.validateEventContract(ev);
      if (!isValid) {
        anomalies += 1;
      }
    });

    return {
      scanDetails: `Saneamento e reconciliação analisou ${history.length} eventos no histórico atual.`,
      inconsistenciesFound: anomalies
    };
  }
}

export const consistencyService = new ConsistencyService();
export default consistencyService;
