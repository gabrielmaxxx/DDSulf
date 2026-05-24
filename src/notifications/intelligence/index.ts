/**
 * DDSulf Advanced Operational Intelligence Alert Generators
 * Continuously evaluates margin structures, work buffers, and syncing latency levels.
 */

import { OperationalAlert, AlertSeverity, AlertCategory } from '../types';
import { AlertPrioritizationEngine } from '../prioritization';

export class OperationalIntelligenceService {
  /**
   * Generates custom Financial margin warnings of high business impact
   */
  public static evaluateMarginRisk(
    serviceId: string,
    serviceTitle: string,
    currentMargin: number,
    targetMargin: number
  ): OperationalAlert | null {
    if (currentMargin >= targetMargin) return null;

    const marginDiff = ((targetMargin - currentMargin) * 100).toFixed(1);
    const alertBody: Omit<OperationalAlert, 'id' | 'timestamp' | 'isRead'> = {
      category: 'financial',
      severity: currentMargin < 0.1 ? 'critical' : 'high',
      title: 'Margem Financeira Abaixo do Alvo',
      message: `O serviço "${serviceTitle}" está com margem de ${(currentMargin * 100).toFixed(1)}% (Défice de ${marginDiff}% abaixo do alvo comercial).`,
      routeUrl: `/calculator?id=${serviceId}`,
      dedupKey: `margin-risk-${serviceId}-${currentMargin < 0.1 ? 'crit' : 'warn'}`,
      rolesPermitted: ['super_admin', 'admin', 'financeiro'],
      metadata: { serviceId, currentMargin, targetMargin }
    };

    const status = AlertPrioritizationEngine.calculateRelevance(alertBody);
    if (!status.shouldDeliver) return null;

    return {
      id: 'alrt_' + Math.random().toString(36).substr(2, 9),
      ...alertBody,
      severity: status.adjustedSeverity,
      timestamp: Date.now(),
      isRead: false
    };
  }

  /**
   * Identifies uncompleted client quotes wizards stalled in device draft boxes
   */
  public static evaluateAbandonedWorkflow(
    workflowId: string,
    companyName: string,
    stepKey: string,
    abandonedHours: number
  ): OperationalAlert | null {
    if (abandonedHours < 12) return null; // Ignore short halts

    const alertBody: Omit<OperationalAlert, 'id' | 'timestamp' | 'isRead'> = {
      category: 'workflow',
      severity: abandonedHours > 48 ? 'high' : 'medium',
      title: 'Rascunho de Proposta Estagnado',
      message: `A proposta comercial para "${companyName}" está parada na etapa "${stepKey}" há ${abandonedHours} horas.`,
      routeUrl: `/workflow?id=${workflowId}`,
      dedupKey: `abandoned-wf-${workflowId}-${abandonedHours > 48 ? 'high' : 'med'}`,
      rolesPermitted: ['super_admin', 'admin', 'gestor_operacional', 'comercial'],
      metadata: { workflowId, abandonedHours }
    };

    const status = AlertPrioritizationEngine.calculateRelevance(alertBody);
    if (!status.shouldDeliver) return null;

    return {
      id: 'alrt_' + Math.random().toString(36).substr(2, 9),
      ...alertBody,
      severity: status.adjustedSeverity,
      timestamp: Date.now(),
      isRead: false
    };
  }

  /**
   * Identifies excessive delays in background outbox synchronizations
   */
  public static evaluateSyncLatency(
    backlogCount: number,
    latencyMs: number
  ): OperationalAlert | null {
    if (backlogCount < 3 && latencyMs < 2000) return null;

    const severity: AlertSeverity = backlogCount > 10 || latencyMs > 8000 ? 'high' : 'medium';
    const alertBody: Omit<OperationalAlert, 'id' | 'timestamp' | 'isRead'> = {
      category: 'sync',
      severity,
      title: 'Latência de Sincronização de Campo',
      message: `Conexão instável de campo encontrada. Há ${backlogCount} mutações de vistorias pendentes no buffer local.`,
      dedupKey: `sync-latency-high`,
      rolesPermitted: ['super_admin', 'admin', 'gestor_operacional', 'tecnico'],
      metadata: { backlogCount, latencyMs }
    };

    const status = AlertPrioritizationEngine.calculateRelevance(alertBody);
    if (!status.shouldDeliver) return null;

    return {
      id: 'alrt_' + Math.random().toString(36).substr(2, 9),
      ...alertBody,
      severity: status.adjustedSeverity,
      timestamp: Date.now(),
      isRead: false
    };
  }
}

export default OperationalIntelligenceService;
