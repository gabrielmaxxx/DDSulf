/**
 * PestFlow Core Transactional Workflow Execution Engine
 * Evaluates triggers, handles operational state steps, executes dynamic workflows, and handles auto-retries.
 */

import { WorkflowRule, WorkflowInstance, WorkflowStatus, WorkflowAction } from '../types';
import { RuleEvaluator } from '../rules/evaluator';
import { EventBusService } from '../../notifications/events/eventBus';
import { NotificationService } from '../../notifications/services/notificationService';
import { tenantStorage } from '@/utils/storage';

export class WorkflowEngineService {
  private static STORAGE_KEY = 'workflow_instances';
  private static RULES_KEY = 'workflow_rules';
  private static METRICS_KEY = 'workflow_metrics';

  private static listeners: Set<() => void> = new Set();

  public static subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => { this.listeners.delete(cb); };
  }

  private static notifyListeners() {
    this.listeners.forEach(cb => {
      try { cb(); } catch (e) { console.error(e); }
    });
  }

  /**
   * Returns active workflow execution templates (pre-configured)
   */
  public static getRules(): WorkflowRule[] {
    const stored = tenantStorage.getItem(this.RULES_KEY);
    if (stored) return JSON.parse(stored);

    // Bootstrap standard operational automatic workflows
    const defaults: WorkflowRule[] = [
      {
        id: 'rule_critical_margin',
        name: 'Auto-Tratamento de Margem Crítica',
        isActive: true,
        priority: 100,
        trigger: {
          id: 'tr_margin_drop',
          type: 'event',
          eventKey: 'alert.financial.critical', // Linked with high severity events triggers
        },
        actions: [
          {
            id: 'act_lock_cost',
            type: 'lock_pricing_model',
            payload: { lockCostModel: true, note: 'Margem Crítica detectada por Regra Automática' }
          },
          {
            id: 'act_trigger_recommendation',
            type: 'trigger_ai_recommendation',
            payload: { triggerId: 'rec_price_hike' }
          }
        ]
      },
      {
        id: 'rule_stalled_quote_followup',
        name: 'Auto Follow-up de Orçamentos Estagnados',
        isActive: true,
        priority: 80,
        trigger: {
          id: 'tr_abandon_hours',
          type: 'condition_threshold',
          conditionExpression: 'payload.abandonedHours >= 24'
        },
        actions: [
          {
            id: 'act_dispatch_followup',
            type: 'dispatch_notice',
            payload: {
              category: 'workflow',
              severity: 'medium',
              title: 'Automação: Follow-up de Proposta Ativado',
              message: 'Checklist de conformidade sanitária disparado para prospecção comercial.'
            }
          }
        ]
      },
      {
        id: 'rule_sync_field_latency_recovery',
        name: 'Recuperação Automática de Latência de Sincronia',
        isActive: true,
        priority: 90,
        trigger: {
          id: 'tr_sync_lag',
          type: 'condition_threshold',
          conditionExpression: 'payload.backlogCount >= 5'
        },
        actions: [
          {
            id: 'act_defer_local_analytics',
            type: 'sync_to_cloud',
            payload: { forceLocalCompression: true }
          }
        ]
      }
    ];

    tenantStorage.setItem(this.RULES_KEY, JSON.stringify(defaults));
    return defaults;
  }

  /**
   * Persists active rules templates back to memory
   */
  public static saveRules(rules: WorkflowRule[]): void {
    tenantStorage.setItem(this.RULES_KEY, JSON.stringify(rules));
    this.notifyListeners();
  }

  /**
   * Gets running workflow instances status logs
   */
  public static getInstances(): WorkflowInstance[] {
    const stored = tenantStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private static saveInstances(instances: WorkflowInstance[]) {
    tenantStorage.setItem(this.STORAGE_KEY, JSON.stringify(instances));
    this.notifyListeners();
  }

  /**
   * Evaluates active conditions on an event, spawning instances if criteria are met
   */
  public static handleEvent(eventKey: string, payload: Record<string, any>): void {
    const rules = this.getRules().filter(r => r.isActive);

    for (const rule of rules) {
      let isTriggered = false;

      // Type A: Event Key exact match
      if (rule.trigger.type === 'event' && rule.trigger.eventKey === eventKey) {
        isTriggered = true;
      }
      // Type B: Expressive dynamic thresholds evaluation
      else if (rule.trigger.type === 'condition_threshold' && rule.trigger.conditionExpression) {
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
   * Creates and triggers a live running state workflow instance node
   */
  private static instantiateWorkflow(rule: WorkflowRule, payload: Record<string, any>) {
    const instances = this.getInstances();

    // Prevent duplicate spawning of currently active executions on identical rule IDs to prevent loop freezes
    const isAlreadyRunning = instances.some(i => i.ruleId === rule.id && i.status === 'running');
    if (isAlreadyRunning) return;

    const instance: WorkflowInstance = {
      id: 'inst_' + Math.random().toString(36).substr(2, 9),
      ruleId: rule.id,
      name: rule.name,
      status: 'idle',
      currentStepIndex: 0,
      payload: { ...payload },
      startedAt: Date.now(),
      retryCount: 0,
      errorLog: [],
      executionTrail: ['Workflow criado em buffer.']
    };

    const updated = [instance, ...instances].slice(0, 100);
    this.saveInstances(updated);

    // Boot execution queue loop asynchronously
    setTimeout(() => {
      this.executeInstance(instance.id);
    }, 10);
  }

  /**
   * Processes steps consecutively
   */
  public static async executeInstance(instanceId: string): Promise<void> {
    const instances = this.getInstances();
    const instIdx = instances.findIndex(i => i.id === instanceId);
    if (instIdx === -1) return;

    const inst = instances[instIdx];
    const rules = this.getRules();
    const rule = rules.find(r => r.id === inst.ruleId);

    if (!rule) {
      inst.status = 'failed';
      inst.executionTrail.push('Erro: Template de regra original expirado ou inexistente.');
      this.saveInstances(instances);
      return;
    }

    inst.status = 'running';
    inst.executionTrail.push('Sessão iniciada na fila principal de processamento.');
    this.saveInstances(instances);

    const steps = rule.actions;
    let stepCount = inst.currentStepIndex;

    const startTime = Date.now();

    while (stepCount < steps.length) {
      const step = steps[stepCount];
      inst.currentStepIndex = stepCount;
      inst.executionTrail.push(`Executando ação [${step.type}]: Identificador ${step.id}`);
      this.saveInstances(instances);

      try {
        await this.runSingleAction(step, inst.payload);
        inst.executionTrail.push(`Ação [${step.type}] concluída perfeitamente.`);
        stepCount++;
      } catch (err: any) {
        inst.executionTrail.push(`Falha na ação: ${err.message || err}`);
        inst.retryCount++;

        if (inst.retryCount <= 2) {
          inst.status = 'retrying';
          inst.executionTrail.push(`Re-escalando tentativa de recuperação ${inst.retryCount}/2...`);
          this.saveInstances(instances);
          await new Promise(resolve => setTimeout(resolve, 50)); // Fast wait before retry
          continue;
        } else {
          inst.status = 'failed';
          inst.completedAt = Date.now();
          inst.executionTrail.push('Workflow encerrado com erros críticos irrecuperáveis.');
          this.saveInstances(instances);
          this.recordMetric(false, Date.now() - startTime);
          return;
        }
      }
    }

    inst.status = 'completed';
    inst.completedAt = Date.now();
    inst.executionTrail.push('Operação concluída com total integridade de passos.');
    this.saveInstances(instances);

    this.recordMetric(true, Date.now() - startTime);
  }

  /**
   * Action Router: Map abstract workflow tasks to execution services
   */
  private static async runSingleAction(action: WorkflowAction, payload: Record<string, any>): Promise<void> {
    switch (action.type) {
      case 'dispatch_notice':
        NotificationService.dispatch({
          id: 'alrt_' + Math.random().toString(36).substr(2, 9),
          category: action.payload.category || 'operations',
          severity: action.payload.severity || 'medium',
          title: action.payload.title || 'Alerta do Motor',
          message: action.payload.message || 'Alerta automático disparado.',
          timestamp: Date.now(),
          isRead: false
        });
        break;

      case 'lock_pricing_model':
        // Safeguard locks financial edits
        tenantStorage.setItem('financial_model_governed_lock', 'true');
        break;

      case 'trigger_ai_recommendation':
        // Simulates pushing dynamic parameters into local recommendations score indexes
        EventBusService.publish('ai.recommendation.force_refresh', action.payload);
        break;

      case 'sync_to_cloud':
        // Runs instant offline state synchronization queue flushes
        EventBusService.publish('sync.outbox.flush', { forced: true });
        break;

      default:
        throw new Error(`Ação do passo informada não é suportada: ${action.type}`);
    }
  }

  /**
   * Aggregates execution efficiency telemetry
   */
  private static recordMetric(isSuccess: boolean, latencyMs: number) {
    const currentStr = tenantStorage.getItem(this.METRICS_KEY);
    let metrics = currentStr ? JSON.parse(currentStr) : {
      totalTriggered: 0,
      successRate: 1.0,
      averageLatencyMs: 200,
      failuresPreventedCount: 0,
      activeExecutors: 0
    };

    metrics.totalTriggered++;
    if (!isSuccess) {
      metrics.successRate = (metrics.successRate * (metrics.totalTriggered - 1)) / metrics.totalTriggered;
    } else {
      metrics.successRate = ((metrics.successRate * (metrics.totalTriggered - 1)) + 1) / metrics.totalTriggered;
      metrics.failuresPreventedCount++;
    }

    metrics.averageLatencyMs = Math.round(((metrics.averageLatencyMs * (metrics.totalTriggered - 1)) + latencyMs) / metrics.totalTriggered);

    tenantStorage.setItem(this.METRICS_KEY, JSON.stringify(metrics));
  }

  public static getMetrics(): any {
    const stored = tenantStorage.getItem(this.METRICS_KEY);
    return stored ? JSON.parse(stored) : {
      totalTriggered: 0,
      successRate: 1.0,
      averageLatencyMs: 150,
      failuresPreventedCount: 0,
      activeExecutors: 1
    };
  }

  public static clearInstanceLogs(): void {
    this.saveInstances([]);
  }
}

export default WorkflowEngineService;
