/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { OrchestrationWorkflow, OperationalEventType, SystemModuleName, OperationalEvent } from '../types';
import { eventBusService } from './eventBusService';
import { tenantStorage } from '@/utils/storage';

const WORKFLOW_STORAGE_KEY = 'orchestration_workflows';

export class OrchestrationService {
  private workflows: OrchestrationWorkflow[] = [];

  constructor() {
    this.restoreWorkflows();
    this.registerTriggers();
  }

  private restoreWorkflows() {
    try {
      const saved = tenantStorage.getItem(WORKFLOW_STORAGE_KEY);
      if (saved) {
        this.workflows = JSON.parse(saved);
      } else {
        this.workflows = [
          {
            id: 'wf_01_dosage_chain',
            workflowName: 'Orquestração de Dosagem e Validação de Insumos',
            triggerEvent: OperationalEventType.PESTICIDE_CALCULATED,
            status: 'idle',
            steps: [
              { stepId: 's1', actionDescription: 'Verificar disponibilidade de estoque mínimo', targetModule: SystemModuleName.STOCK, executed: false },
              { stepId: 's2', actionDescription: 'Registrar orçamento preliminar no financeiro', targetModule: SystemModuleName.FINANCIAL, executed: false },
              { stepId: 's3', actionDescription: 'Minutar laudo técnico Anvisa', targetModule: SystemModuleName.POPS, executed: false },
              { stepId: 's4', actionDescription: 'Submeter dados ao algoritmo preditivo de IA', targetModule: SystemModuleName.AI, executed: false }
            ]
          },
          {
            id: 'wf_02_pops_compliance',
            workflowName: 'Validação e Saneamento de POPs Regulatórios',
            triggerEvent: OperationalEventType.POP_SAVED_ANVISA,
            status: 'idle',
            steps: [
              { stepId: 's1_pop', actionDescription: 'Conciliar faturas associadas no financeiro', targetModule: SystemModuleName.FINANCIAL, executed: false },
              { stepId: 's2_pop', actionDescription: 'Sincronizar telemetria e integridade da aspersão', targetModule: SystemModuleName.AI, executed: false },
              { stepId: 's3_pop', actionDescription: 'Baixar estoque de defensivo certificado', targetModule: SystemModuleName.STOCK, executed: false }
            ]
          }
        ];
        this.persist();
      }
    } catch {
      // safe fallback
    }
  }

  private persist() {
    try {
      tenantStorage.setItem(WORKFLOW_STORAGE_KEY, JSON.stringify(this.workflows));
    } catch (e) {
      console.warn('Orchestration workflows save failed:', e);
    }
  }

  private registerTriggers() {
    // Listen for pesticide calculation, trigger workflow wf_01
    eventBusService.subscribe(OperationalEventType.PESTICIDE_CALCULATED, (event) => {
      this.executeWorkflow('wf_01_dosage_chain', event);
    });

    // Listen for POP saved, trigger workflow wf_02
    eventBusService.subscribe(OperationalEventType.POP_SAVED_ANVISA, (event) => {
      this.executeWorkflow('wf_02_pops_compliance', event);
    });
  }

  public getWorkflows(): OrchestrationWorkflow[] {
    return this.workflows;
  }

  public async executeWorkflow(workflowId: string, triggerEvent: OperationalEvent) {
    const wf = this.workflows.find(w => w.id === workflowId);
    if (!wf || wf.status === 'executing') return;

    wf.status = 'executing';
    wf.steps.forEach(s => s.executed = false);
    this.persist();

    eventBusService.logTelemetry(
      'info',
      SystemModuleName.INTEGRATION,
      `Fluxo de orquestração "${wf.workflowName}" iniciado pelo evento correlacionado.`,
      triggerEvent.correlationId
    );

    // Simulate stepping through with delay
    for (let i = 0; i < wf.steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      wf.steps[i].executed = true;
      this.persist();
      
      eventBusService.logTelemetry(
        'info',
        wf.steps[i].targetModule,
        `Etapa [${wf.steps[i].stepId}] concluída: ${wf.steps[i].actionDescription}`,
        triggerEvent.correlationId
      );
    }

    wf.status = 'completed';
    this.persist();

    // Trigger reconciliation complete event
    eventBusService.publish(
      OperationalEventType.FLOW_RECONCILIATION_COMPLETED,
      { workflowId, originEvent: triggerEvent.eventName },
      SystemModuleName.INTEGRATION,
      triggerEvent.correlationId
    );
  }

  public resetWorkflowStates() {
    this.workflows.forEach(w => {
      w.status = 'idle';
      w.steps.forEach(s => s.executed = false);
    });
    this.persist();
  }
}

export const orchestrationService = new OrchestrationService();
export default orchestrationService;
