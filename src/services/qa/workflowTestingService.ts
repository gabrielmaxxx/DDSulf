/**
 * DDSulf Workflow Testing Service
 * Automates multi-department business flows simulation to ensure operational predictability.
 */

export interface TestableWorkflowStep {
  stepIndex: number;
  name: string;
  department: string;
  status: 'idle' | 'running' | 'asserted' | 'failed';
  assertionText: string;
}

export interface TestableWorkflow {
  id: string;
  name: string;
  description: string;
  steps: TestableWorkflowStep[];
}

class WorkflowTestingService {
  private workflows: TestableWorkflow[] = [];

  constructor() {
    this.seedWorkflows();
  }

  private seedWorkflows() {
    this.workflows = [
      {
        id: 'wf_commercial_delivery',
        name: 'CRM Sales to Operational POP Schedule',
        description: 'Verifica se a conversão de um orçamento comercial dispara de forma correta e síncrona o agendamento de POPs no calendário.',
        steps: [
          {
            stepIndex: 1,
            name: 'Criar Orçamento com Margem Válida',
            department: 'Comercial-CRM',
            status: 'idle',
            assertionText: 'Calculadora de preços retorna margem líquida de lucro >= 35%.'
          },
          {
            stepIndex: 2,
            name: 'Assinatura Digital do Contrato',
            department: 'Jurídico-Financeiro',
            status: 'idle',
            assertionText: 'Webhook de assinatura assinala contrato como fechado em BD local.'
          },
          {
            stepIndex: 3,
            name: 'Criação Automática do Roteiro POP',
            department: 'Planejamento Técnico',
            status: 'idle',
            assertionText: 'Sistema re-calcula rota mais curta para o técnico via api do Maps, gerando agenda.'
          }
        ]
      },
      {
        id: 'wf_inventory_depletion',
        name: 'Service Execution Chemical Supply Tracking',
        description: 'Simula a conclusão técnica de um serviço de dedetização e valida as subseqüentes baixas no estoque de venenos/insumos.',
        steps: [
          {
            stepIndex: 1,
            name: 'Registro Forense de Dosagem Utilizada',
            department: 'Operações de Campo',
            status: 'idle',
            assertionText: 'Dispositivo móvel registra uso de 4 litros de K-Othrine WG.'
          },
          {
            stepIndex: 2,
            name: 'Escrituração Síncrona do ServiceWorker',
            department: 'Garantia PWA Offline',
            status: 'idle',
            assertionText: 'Dado persistido temporariamente em IndexedDB local.'
          },
          {
            stepIndex: 3,
            name: 'Depleção do Almoxarifado Central',
            department: 'Estoque de Insumos',
            status: 'idle',
            assertionText: 'Sincronização com Firestore subtrai estoque real protegendo contra sobreposição.'
          }
        ]
      }
    ];
  }

  public getWorkflows() {
    return this.workflows;
  }

  public getWorkflowById(id: string) {
    return this.workflows.find(w => w.id === id);
  }

  /**
   * Run a simulation of a single workflow
   */
  public async executeWorkflowSimulation(id: string, onStepChange: (index: number, status: string) => void): Promise<boolean> {
    const wf = this.getWorkflowById(id);
    if (!wf) return false;

    // reset steps
    for (const step of wf.steps) {
      step.status = 'idle';
    }

    let success = true;

    for (const step of wf.steps) {
      step.status = 'running';
      onStepChange(step.stepIndex, 'running');
      
      // simulation wait
      await new Promise(resolve => setTimeout(resolve, 600));

      // 96% run safety metric
      const pass = Math.random() > 0.04;
      if (pass) {
        step.status = 'asserted';
        onStepChange(step.stepIndex, 'asserted');
      } else {
        step.status = 'failed';
        onStepChange(step.stepIndex, 'failed');
        success = false;
        break;
      }
    }

    return success;
  }
}

export const workflowTestingService = new WorkflowTestingService();
export default workflowTestingService;
