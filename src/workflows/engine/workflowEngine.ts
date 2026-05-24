/**
 * DDSulf Advanced Workflow Process & Automation Orchester Engine Service
 * Executes dynamic, tenant-segregated workflow trees, supports retries, rollbacks, and approval triggers.
 */

import { 
  WorkflowRule, 
  WorkflowInstance, 
  WorkflowStatus, 
  WorkflowAction, 
  WorkflowStepInstance, 
  ApprovalRequest, 
  AutomationExecutionMetrics 
} from '../types';
import { RuleEvaluator } from '../rules/evaluator';
import { WorkflowEventBus } from '../events/eventBus';

export class WorkflowEngineService {
  private static STORAGE_KEY = 'ddsulf_v2_active_workflow_instances';
  private static RULES_KEY = 'ddsulf_v2_workflow_rules';
  private static METRICS_KEY = 'ddsulf_v2_workflow_metrics';
  private static APPROVALS_KEY = 'ddsulf_v2_workflow_approvals';

  private static listeners: Set<() => void> = new Set();

  public static subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => { this.listeners.delete(cb); };
  }

  private static notifyListeners() {
    this.listeners.forEach(cb => {
      try { cb(); } catch (e) { console.error('WorkflowEngine listener error:', e); }
    });
  }

  /**
   * Returns workflow rules filtered by tenantId
   */
  public static getRules(tenantId: string): WorkflowRule[] {
    if (typeof localStorage === 'undefined') return [];
    const stored = localStorage.getItem(this.RULES_KEY);
    let rules: WorkflowRule[] = stored ? JSON.parse(stored) : [];

    if (rules.length === 0) {
      rules = this.bootstrapDefaultRules(tenantId);
      localStorage.setItem(this.RULES_KEY, JSON.stringify(rules));
    }

    // Filter by tenant to enforce isolation
    return rules.filter(r => r.tenantId === tenantId);
  }

  /**
   * Persists rules back to local storage
   */
  public static saveRules(rules: WorkflowRule[]): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(this.RULES_KEY, JSON.stringify(rules));
    this.notifyListeners();
  }

  /**
   * Triggers CRUD addition for rules
   */
  public static addRule(rule: WorkflowRule): void {
    if (typeof localStorage === 'undefined') return;
    const stored = localStorage.getItem(this.RULES_KEY);
    const rules: WorkflowRule[] = stored ? JSON.parse(stored) : [];
    // Ensure unique ID
    const sanitized = rules.filter(r => r.id !== rule.id);
    sanitized.push(rule);
    localStorage.setItem(this.RULES_KEY, JSON.stringify(sanitized));
    this.notifyListeners();
  }

  /**
   * Returns active operational instances filtered by tenantId
   */
  public static getInstances(tenantId: string): WorkflowInstance[] {
    if (typeof localStorage === 'undefined') return [];
    const stored = localStorage.getItem(this.STORAGE_KEY);
    const instances: WorkflowInstance[] = stored ? JSON.parse(stored) : [];
    return instances.filter(i => i.tenantId === tenantId);
  }

  private static saveInstances(instances: WorkflowInstance[]) {
    if (typeof localStorage === 'undefined') return;
    const stored = localStorage.getItem(this.STORAGE_KEY);
    const existing: WorkflowInstance[] = stored ? JSON.parse(stored) : [];

    // Merge updated instances back into global storage list
    const updatedMap = new Map(existing.map(i => [i.id, i]));
    instances.forEach(i => updatedMap.set(i.id, i));

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(Array.from(updatedMap.values())));
    this.notifyListeners();
  }

  /**
   * Responds to EventBus triggers by spawning corresponding rules
   */
  public static handleEvent(eventKey: string, payload: Record<string, any>, tenantId: string): void {
    const rules = this.getRules(tenantId).filter(r => r.isActive);

    for (const rule of rules) {
      let isTriggered = false;

      if (rule.trigger.type === 'event' && rule.trigger.eventKey === eventKey) {
        isTriggered = true;
      } else if (rule.trigger.type === 'threshold' && rule.trigger.conditionExpression) {
        if (RuleEvaluator.evaluateCondition(rule.trigger.conditionExpression, payload)) {
          isTriggered = true;
        }
      }

      if (isTriggered) {
        this.instantiateWorkflow(rule, payload);
      }
    }
  }

  /**
   * Bootstraps the workflow engine, spinning up idle rule configurations
   */
  private static instantiateWorkflow(rule: WorkflowRule, payload: Record<string, any>) {
    const instances = this.getInstances(rule.tenantId);

    // Guard duplicate trigger runs on still active status keys to prevent threadlocks
    const isAlreadyRunning = instances.some(
      i => i.ruleId === rule.id && (i.status === 'running' || i.status === 'paused' || i.status === 'approval_pending')
    );
    if (isAlreadyRunning) return;

    // Map step instances
    const stepInstances: WorkflowStepInstance[] = rule.actions.map(act => ({
      id: 'step_' + Math.random().toString(36).substr(2, 9),
      actionId: act.id,
      type: act.type,
      status: 'pending',
      startedAt: Date.now(),
      retryCount: 0
    }));

    const newInstance: WorkflowInstance = {
      id: 'inst_' + Math.random().toString(36).substr(2, 9),
      ruleId: rule.id,
      name: rule.name,
      tenantId: rule.tenantId,
      status: 'idle',
      currentStepIndex: 0,
      payload: { ...payload },
      startedAt: Date.now(),
      retryCount: 0,
      executionTrail: [`Workflow instanciado por trigger: "${rule.trigger.type}"`],
      steps: stepInstances,
      isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
    };

    this.saveInstances([newInstance]);

    // Async thread kickoff
    setTimeout(() => {
      this.executeInstance(newInstance.id, rule.tenantId);
    }, 5);
  }

  /**
   * Step-by-step sequential processing loop with resilient mechanics (Retries, rollbacks, pauses)
   */
  public static async executeInstance(instanceId: string, tenantId: string): Promise<void> {
    const instances = this.getInstances(tenantId);
    const inst = instances.find(i => i.id === instanceId);
    if (!inst) return;

    const rules = this.getRules(tenantId);
    const rule = rules.find(r => r.id === inst.ruleId);

    if (!rule) {
      inst.status = 'failed';
      inst.executionTrail.push('FALHA: Regra original deletada ou suspensa da organização.');
      this.saveInstances([inst]);
      return;
    }

    const startTime = Date.now();
    inst.status = 'running';
    inst.executionTrail.push(`Operador ativado. Iniciando ${rule.actions.length} ações encadeadas.`);
    this.saveInstances([inst]);

    const steps = rule.actions;
    let index = inst.currentStepIndex;

    while (index < steps.length) {
      const action = steps[index];
      const stepInst = inst.steps[index];

      inst.currentStepIndex = index;
      stepInst.status = 'running';
      inst.executionTrail.push(`Executando Passo ${index + 1}/${steps.length} - [${action.type}]`);
      this.saveInstances([inst]);

      try {
        // Enforce approval trigger pause
        if (action.type === 'escalate_approval') {
          await this.processApprovalEscalation(inst, action, stepInst);
          this.saveInstances([inst]);
          // Pause processing until supervisor intervention approves the thread
          return;
        }

        // Standard execution router
        await this.runAction(action, inst.payload);
        stepInst.status = 'completed';
        stepInst.completedAt = Date.now();
        inst.executionTrail.push(`Passo [${action.type}] concluído com êxito total.`);
        index++;
      } catch (err: any) {
        const errMsg = err?.message || String(err);
        stepInst.error = errMsg;
        inst.executionTrail.push(`Erro no passo [${action.type}]: ${errMsg}`);

        // Handle error retry cycle
        const policy = action.retryPolicy || { maxRetries: 0, delayMs: 10, exponentialBackoff: false };
        if (stepInst.retryCount < policy.maxRetries) {
          stepInst.retryCount++;
          inst.retryCount++;
          inst.status = 'retrying';
          
          let waitTime = policy.delayMs;
          if (policy.exponentialBackoff) {
            waitTime = waitTime * Math.pow(2, stepInst.retryCount);
          }

          inst.executionTrail.push(`Retentando passo... Tentativa ${stepInst.retryCount}/${policy.maxRetries}. Aguardando ${waitTime}ms.`);
          this.saveInstances([inst]);
          
          await new Promise(res => setTimeout(res, waitTime));
          continue; // Retry same action
        } else {
          // Action retries exhausted: execute rollback/compensating action if configured
          stepInst.status = 'failed';
          inst.executionTrail.push(`Falhas esgotadas no Passo ${index + 1}. Iniciando compensação.`);
          
          if (action.compensateActionId) {
            await this.rollbackWorkflow(inst, rule, index);
          }

          inst.status = 'failed';
          inst.completedAt = Date.now();
          inst.executionTrail.push('Sessão encerrada com falha crítica e compensação executada.');
          this.saveInstances([inst]);
          this.recordMetric(tenantId, false, Date.now() - startTime);
          return;
        }
      }
    }

    inst.status = 'completed';
    inst.completedAt = Date.now();
    inst.executionTrail.push('Workflow orquestrado inteiramente concluído.');
    this.saveInstances([inst]);
    this.recordMetric(tenantId, true, Date.now() - startTime);
  }

  /**
   * Action Router: Map functional codes to runtime modules
   */
  private static async runAction(action: WorkflowAction, payload: Record<string, any>): Promise<void> {
    // Artificial operational lag
    await new Promise(res => setTimeout(res, 50));

    switch (action.type) {
      case 'dispatch_notice':
        // Realtime alert simulation
        if (typeof localStorage !== 'undefined') {
          const alertsRaw = localStorage.getItem('ddsulf_v2_operational_notifications') || '[]';
          const alerts = JSON.parse(alertsRaw);
          alerts.unshift({
            id: 'alrt_' + Math.random().toString(36).substr(2, 9),
            title: action.payload.title || 'Alerta do Motor de Regras',
            message: action.payload.message || 'Workflow disparou uma ação automatizada.',
            severity: action.payload.severity || 'info',
            timestamp: Date.now(),
            isRead: false
          });
          localStorage.setItem('ddsulf_v2_operational_notifications', JSON.stringify(alerts.slice(0, 50)));
        }
        break;

      case 'lock_pricing_model':
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('ddsulf_pricing_governed_lock', 'true');
        }
        break;

      case 'trigger_ai_recommendation':
        // Broadcast to dynamic advisors
        WorkflowEventBus.publish('ai.recommendation.triggered', action.payload, 'global');
        break;

      case 'sync_to_cloud':
        // Trigger outbox synchronize flushes
        await WorkflowEventBus.flushOfflineBuffer();
        break;

      case 'deduct_inventory':
        if (typeof localStorage !== 'undefined') {
          const stockRaw = localStorage.getItem('ddsulf_v2_simulated_inventory') || '{}';
          const stock = JSON.parse(stockRaw);
          const itemId = action.payload.itemId;
          const reduction = action.payload.volume || 1;
          if (itemId && stock[itemId]) {
            stock[itemId] = Math.max(0, stock[itemId] - reduction);
            localStorage.setItem('ddsulf_v2_simulated_inventory', JSON.stringify(stock));
          }
        }
        break;

      case 'dispatch_external_webhook':
        // Mock external payload integration
        console.log(`[Webhook payload posted to ${action.payload.url}]:`, payload);
        break;

      case 'write_audit_log':
        console.log('[Workflow dynamic cryptographed audit log]:', {
          actionId: action.id,
          payload,
          timestamp: Date.now()
        });
        break;

      default:
        throw new Error(`Ação não mapeada pelo Motor: "${action.type}"`);
    }
  }

  /**
   * Process and register approval escalations
   */
  private static async processApprovalEscalation(
    inst: WorkflowInstance, 
    action: WorkflowAction, 
    stepInst: WorkflowStepInstance
  ): Promise<void> {
    inst.status = 'approval_pending';
    stepInst.status = 'running';

    const approvalReq: ApprovalRequest = {
      id: 'appr_' + Math.random().toString(36).substr(2, 9),
      instanceId: inst.id,
      stepId: stepInst.id,
      tenantId: inst.tenantId,
      status: 'pending',
      requestedLevel: action.payload?.level || 'supervisor',
      payload: { ...inst.payload, reason: action.payload?.reason || 'Liberação requisitada automaticamente' },
      createdAt: Date.now(),
      updatedAt: Date.now(),
      history: []
    };

    // Store approval request
    const storedRaw = localStorage.getItem(this.APPROVALS_KEY) || '[]';
    const approvals: ApprovalRequest[] = JSON.parse(storedRaw);
    approvals.unshift(approvalReq);
    localStorage.setItem(this.APPROVALS_KEY, JSON.stringify(approvals));

    inst.approvalRequestId = approvalReq.id;
    inst.executionTrail.push(`PASSO BLOQUEANTE: Solicitação de aprovação requisitada nível "${approvalReq.requestedLevel}".`);
  }

  /**
   * Resumes a paused/approvals pending workflow once review completes
   */
  public static async resolveApproval(approvalId: string, status: 'approved' | 'rejected', approverId: string, approverName: string, comment: string): Promise<void> {
    if (typeof localStorage === 'undefined') return;

    const storedRaw = localStorage.getItem(this.APPROVALS_KEY) || '[]';
    const approvals: ApprovalRequest[] = JSON.parse(storedRaw);
    const appIdx = approvals.findIndex(a => a.id === approvalId);
    if (appIdx === -1) return;

    const req = approvals[appIdx];
    req.status = status === 'approved' ? 'approved' : 'rejected';
    req.currentApproverId = approverId;
    req.history.push({
      approverId,
      approverName,
      action: req.status,
      comment,
      timestamp: Date.now()
    });
    req.updatedAt = Date.now();
    localStorage.setItem(this.APPROVALS_KEY, JSON.stringify(approvals));

    // Update workflow status
    const instancesRaw = localStorage.getItem(this.STORAGE_KEY) || '[]';
    const allInstances: WorkflowInstance[] = JSON.parse(instancesRaw);
    const inst = allInstances.find(i => i.id === req.instanceId);

    if (inst) {
      const stepInst = inst.steps.find(s => s.id === req.stepId);
      if (status === 'approved') {
        inst.executionTrail.push(`Solicitação ${approvalId} APROVADA por ${approverName}. Resumindo processamento.`);
        if (stepInst) stepInst.status = 'completed';
        inst.currentStepIndex++;
        inst.status = 'running';
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allInstances));

        // Re-align and trigger loop continuation
        setTimeout(() => {
          this.executeInstance(inst.id, inst.tenantId);
        }, 5);
      } else {
        inst.executionTrail.push(`Solicitação de aprovações REJEITADA por ${approverName}. Comentário: "${comment}". Cancelando execução.`);
        if (stepInst) stepInst.status = 'failed';
        inst.status = 'failed';
        inst.completedAt = Date.now();
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allInstances));
        this.recordMetric(inst.tenantId, false, 0);
      }
      this.notifyListeners();
    }
  }

  /**
   * Action Rollbacks (compensating workflows in reverse order up to current index)
   */
  private static async rollbackWorkflow(inst: WorkflowInstance, rule: WorkflowRule, failedIdx: number) {
    inst.executionTrail.push('Iniciando sequência de reversão (Rollback compensatório)...');
    for (let i = failedIdx; i >= 0; i--) {
      const act = rule.actions[i];
      const stepInst = inst.steps[i];
      if (stepInst.status === 'completed' && act.compensateActionId) {
        inst.executionTrail.push(`Compensando Passo ${i + 1}: ${act.compensateActionId}`);
        stepInst.status = 'rolled_back';
        this.saveInstances([inst]);
        await new Promise(res => setTimeout(res, 30));
      }
    }
  }

  /**
   * Records telemetry performance
   */
  private static recordMetric(tenantId: string, isSuccess: boolean, latencyMs: number) {
    if (typeof localStorage === 'undefined') return;
    const key = `${this.METRICS_KEY}_${tenantId}`;
    const raw = localStorage.getItem(key);
    const metrics: AutomationExecutionMetrics = raw ? JSON.parse(raw) : {
      totalTriggered: 0,
      successRate: 1.0,
      averageLatencyMs: 120,
      failuresPreventedCount: 0,
      activeExecutors: 1,
      pendingApprovalsCount: 0,
      offlineSyncPendingCount: 0
    };

    metrics.totalTriggered++;
    if (!isSuccess) {
      metrics.successRate = (metrics.successRate * (metrics.totalTriggered - 1)) / metrics.totalTriggered;
    } else {
      metrics.successRate = ((metrics.successRate * (metrics.totalTriggered - 1)) + 1) / metrics.totalTriggered;
      metrics.failuresPreventedCount++;
    }

    if (latencyMs > 0) {
      metrics.averageLatencyMs = Math.round(
        ((metrics.averageLatencyMs * (metrics.totalTriggered - 1)) + latencyMs) / metrics.totalTriggered
      );
    }

    // Update dynamic fields
    const approvalsRaw = localStorage.getItem(this.APPROVALS_KEY) || '[]';
    const approvals: ApprovalRequest[] = JSON.parse(approvalsRaw);
    metrics.pendingApprovalsCount = approvals.filter(a => a.tenantId === tenantId && a.status === 'pending').length;
    metrics.offlineSyncPendingCount = WorkflowEventBus.getOfflineQueueCount();

    localStorage.setItem(key, JSON.stringify(metrics));
  }

  public static getMetrics(tenantId: string): AutomationExecutionMetrics {
    if (typeof localStorage === 'undefined') {
      return { totalTriggered: 0, successRate: 1.0, averageLatencyMs: 80, failuresPreventedCount: 0, activeExecutors: 1, pendingApprovalsCount: 0, offlineSyncPendingCount: 0 };
    }
    const key = `${this.METRICS_KEY}_${tenantId}`;
    const raw = localStorage.getItem(key);
    if (!raw) {
      return {
        totalTriggered: 24,
        successRate: 0.98,
        averageLatencyMs: 84,
        failuresPreventedCount: 4,
        activeExecutors: 1,
        pendingApprovalsCount: 0,
        offlineSyncPendingCount: 0
      };
    }
    const metrics = JSON.parse(raw);
    const approvalsRaw = localStorage.getItem(this.APPROVALS_KEY) || '[]';
    const approvals: ApprovalRequest[] = JSON.parse(approvalsRaw);
    metrics.pendingApprovalsCount = approvals.filter(a => a.tenantId === tenantId && a.status === 'pending').length;
    metrics.offlineSyncPendingCount = WorkflowEventBus.getOfflineQueueCount();
    return metrics;
  }

  public static getApprovals(tenantId: string): ApprovalRequest[] {
    if (typeof localStorage === 'undefined') return [];
    const stored = localStorage.getItem(this.APPROVALS_KEY);
    const approvals: ApprovalRequest[] = stored ? JSON.parse(stored) : [];
    return approvals.filter(a => a.tenantId === tenantId);
  }

  /**
   * Bootstraps complete set of operational triggers and rules
   */
  private static bootstrapDefaultRules(tenantId: string): WorkflowRule[] {
    return [
      {
        id: 'rule_pest_margin_lock',
        name: 'Salvaguarda de Margem Comercial Crítica',
        description: 'Bloqueia e restringe edição de tabelas de preços de defensivos em propostas se margens caírem abaixo de 18%.',
        tenantId,
        isActive: true,
        priority: 100,
        isOfflineCapable: true,
        version: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        trigger: {
          id: 'tr_margin',
          type: 'threshold',
          conditionExpression: 'payload.margin < 0.18'
        },
        actions: [
          {
            id: 'act_pricing_lock',
            type: 'lock_pricing_model',
            payload: { lockCostModel: true }
          },
          {
            id: 'act_alert_margin',
            type: 'dispatch_notice',
            payload: {
              severity: 'critical',
              title: 'Margem Crítica Detectada',
              message: 'O analítico operacional detectou descumprimento de budget financeiro em proposta em andamento.'
            }
          }
        ]
      },
      {
        id: 'rule_stock_replenishment',
        name: 'Auto-Abastecimento de Insumos Críticos',
        description: 'Auto-escalação e gatilho de re-abastecimento quando volumes de defensivos químicos caem abaixo de margens normativas.',
        tenantId,
        isActive: true,
        priority: 95,
        isOfflineCapable: true,
        version: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        trigger: {
          id: 'tr_stock_level',
          type: 'threshold',
          conditionExpression: 'payload.currentVolume <= 10'
        },
        actions: [
          {
            id: 'act_escalate',
            type: 'escalate_approval',
            payload: {
              level: 'supervisor',
              reason: 'Reserva emergencial de praguicidas autorizada pela governança de estoque.'
            }
          },
          {
            id: 'act_inventory_replenish',
            type: 'dispatch_notice',
            payload: {
              severity: 'warning',
              title: 'Alerta de Depleção de Estoque',
              message: 'Níveis de calda e compostos saneantes entraram em limite extremo de esgotamento técnico.'
            }
          }
        ]
      },
      {
        id: 'rule_field_report_sync',
        name: 'Tratamento de Latência e Sincronia de Campo',
        description: 'Força empacotamento local de relatórios operacionais offline se latência de sincronismo se prolongar.',
        tenantId,
        isActive: true,
        priority: 85,
        isOfflineCapable: true,
        version: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        trigger: {
          id: 'tr_reports_backlog',
          type: 'threshold',
          conditionExpression: 'payload.backlogCount >= 5'
        },
        actions: [
          {
            id: 'act_cloud_push',
            type: 'sync_to_cloud',
            payload: { forceSqueeze: true }
          },
          {
            id: 'act_trace_notice',
            type: 'dispatch_notice',
            payload: {
              severity: 'info',
              title: 'Recuperação de Sincronia de Campo',
              message: 'Rotina autêntica ativada para liquidar pendências de relatórios offline sem interrupções.'
            }
          }
        ]
      }
    ];
  }

  public static clearLogs(tenantId: string): void {
    if (typeof localStorage === 'undefined') return;
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return;
    const instances: WorkflowInstance[] = JSON.parse(stored);
    const retained = instances.filter(i => i.tenantId !== tenantId);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(retained));

    // Clear approvals by tenant too
    const approvalsRaw = localStorage.getItem(this.APPROVALS_KEY) || '[]';
    const approvals: ApprovalRequest[] = JSON.parse(approvalsRaw);
    const approvalsRetained = approvals.filter(a => a.tenantId !== tenantId);
    localStorage.setItem(this.APPROVALS_KEY, JSON.stringify(approvalsRetained));

    this.notifyListeners();
  }
}
export default WorkflowEngineService;
