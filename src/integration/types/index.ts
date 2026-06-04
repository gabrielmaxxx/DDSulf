/**
 * SPDX-License-Identifier: Apache-2.0
 */

export enum SystemModuleName {
  DASHBOARD = 'dashboard',
  CALCULATOR = 'calculator',
  FINANCIAL = 'financial',
  POPS = 'pops',
  STOCK = 'stock',
  AI = 'ai',
  INTEGRATION = 'integration',
  SALES = 'sales',
  SERVICE = 'service'
}

export enum OperationalEventType {
  STOCK_LOW = 'stock.low',
  PESTICIDE_CALCULATED = 'pesticide.calculated',
  POP_SAVED_ANVISA = 'pop.saved_anvisa',
  FINANCIAL_TRANSACTION_LOGGED = 'financial.transaction_logged',
  AI_ANOMALY_DETECTED = 'ai.anomaly_detected',
  OFFLINE_SYNC_TRIGGERED = 'offline.sync_triggered',
  FLOW_RECONCILIATION_COMPLETED = 'flow.reconciliation_completed',

  // EVENTOS PADRÃO DDSulf
  CLIENTE_CADASTRADO = 'CLIENTE_CADASTRADO',
  ORCAMENTO_CRIADO = 'ORCAMENTO_CRIADO',
  ORCAMENTO_APROVADO = 'ORCAMENTO_APROVADO',
  ORCAMENTO_REJEITADO = 'ORCAMENTO_REJEITADO',
  OS_CRIADA = 'OS_CRIADA',
  OS_INICIADA = 'OS_INICIADA',
  OS_CONCLUIDA = 'OS_CONCLUIDA',
  OS_CANCELADA = 'OS_CANCELADA',
  ESTOQUE_BAIXADO = 'ESTOQUE_BAIXADO',
  ESTOQUE_MINIMO_ATINGIDO = 'ESTOQUE_MINIMO_ATINGIDO',
  COMPRA_RECEBIDA = 'COMPRA_RECEBIDA',
  CONTA_RECEBER_CRIADA = 'CONTA_RECEBER_CRIADA',
  CONTA_RECEBER_RECEBIDA = 'CONTA_RECEBER_RECEBIDA',
  CONTA_PAGAR_CRIADA = 'CONTA_PAGAR_CRIADA',
  CONTA_PAGAR_PAGA = 'CONTA_PAGAR_PAGA',
  CONTRATO_CRIADO = 'CONTRATO_CRIADO',
  CONTRATO_RENOVADO = 'CONTRATO_RENOVADO',
  CONTRATO_VENCENDO = 'CONTRATO_VENCENDO',
  CONTRATO_ENCERRADO = 'CONTRATO_ENCERRADO',
  VISITA_AGENDADA = 'VISITA_AGENDADA',
  VISITA_REALIZADA = 'VISITA_REALIZADA',
  RETORNO_PROGRAMADO = 'RETORNO_PROGRAMADO'
}

export interface OperationalEvent {
  id: string;
  eventName: OperationalEventType;
  version: string;
  sourceModule: SystemModuleName;
  tenantId: string;
  payload: any;
  timestamp: number;
  origin: 'client_offline' | 'client_online' | 'server_edge';
  correlationId: string;
  traceParent?: string;
  date?: string;
  time?: string;
  user?: string;
}

export interface OrchestrationWorkflow {
  id: string;
  workflowName: string;
  triggerEvent: OperationalEventType;
  status: 'idle' | 'executing' | 'completed' | 'failed';
  steps: {
    stepId: string;
    actionDescription: string;
    targetModule: SystemModuleName;
    executed: boolean;
  }[];
}

export interface IntegrationLog {
  id: string;
  timestamp: number;
  type: 'info' | 'warning' | 'error';
  module: SystemModuleName;
  message: string;
  correlationId: string;
}
