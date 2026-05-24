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
  INTEGRATION = 'integration'
}

export enum OperationalEventType {
  STOCK_LOW = 'stock.low',
  PESTICIDE_CALCULATED = 'pesticide.calculated',
  POP_SAVED_ANVISA = 'pop.saved_anvisa',
  FINANCIAL_TRANSACTION_LOGGED = 'financial.transaction_logged',
  AI_ANOMALY_DETECTED = 'ai.anomaly_detected',
  OFFLINE_SYNC_TRIGGERED = 'offline.sync_triggered',
  FLOW_RECONCILIATION_COMPLETED = 'flow.reconciliation_completed'
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
