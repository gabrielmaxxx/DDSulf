/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { SecurityAuditResult, AIConsistencyMetric } from '../types';
import { INITIAL_SECURITY_AUDITS, INITIAL_AI_METRICS } from '../utils/testCases';

const SECURITY_AUDITS_KEY = 'ddsulf_security_audits';
const AI_METRICS_KEY = 'ddsulf_ai_validation_metrics';

export class OperationalTestingService {
  private audits: SecurityAuditResult[] = [];
  private aiMetrics: AIConsistencyMetric[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.restoreData();
  }

  private restoreData() {
    try {
      const savedAudits = localStorage.getItem(SECURITY_AUDITS_KEY);
      if (savedAudits) {
        this.audits = JSON.parse(savedAudits);
      } else {
        this.audits = [...INITIAL_SECURITY_AUDITS];
        this.persistAudits();
      }

      const savedAi = localStorage.getItem(AI_METRICS_KEY);
      if (savedAi) {
        this.aiMetrics = JSON.parse(savedAi);
      } else {
        this.aiMetrics = [...INITIAL_AI_METRICS];
        this.persistAi();
      }
    } catch {
      this.audits = [...INITIAL_SECURITY_AUDITS];
      this.aiMetrics = [...INITIAL_AI_METRICS];
    }
  }

  private persistAudits() {
    try {
      localStorage.setItem(SECURITY_AUDITS_KEY, JSON.stringify(this.audits));
    } catch (e) {
      console.warn('Audit persistent write error:', e);
    }
    this.notify();
  }

  private persistAi() {
    try {
      localStorage.setItem(AI_METRICS_KEY, JSON.stringify(this.aiMetrics));
    } catch (e) {
      console.warn('AI metrics write error:', e);
    }
    this.notify();
  }

  public subscribe(callback: () => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  public getSecurityAudits() {
    return this.audits;
  }

  public getAIMetrics() {
    return this.aiMetrics;
  }

  public async runTenantSegregationAudit(): Promise<SecurityAuditResult> {
    // Simulates checking segregation rules of cross-tenant tokens
    await new Promise(resolve => setTimeout(resolve, 1800));

    const isLeaked = localStorage.getItem('ddsulf_chaos_tenant_breach') === 'true';
    const auditId = `sec_${Date.now()}`;
    
    const freshAudit: SecurityAuditResult = {
      id: auditId,
      policyName: 'Dynamic Segregamento Multi-Tenant em Fluxo de Evento',
      status: isLeaked ? 'breached' : 'secure',
      testedScopes: ['EventBusRouting', 'SessionVariables', 'ClientSideCacheIsolation'],
      details: isLeaked 
        ? 'AVISO DE EVENTOS ÓRFÃOS EXPOSTOS NA REGIONAL SUL. Tentativa de cross-tenant com Pelotas penetrou no buffer de Porto Alegre.' 
        : 'Segregação organizacional ótima. 1,200 eventos cruzados validados sem nenhum leak de tráfego de-para.',
      tenantId: 'tenant_porto_alegre_01'
    };

    this.audits.unshift(freshAudit);
    this.persistAudits();
    return freshAudit;
  }

  public async validateAICopilotInferences(promptSignature: string): Promise<AIConsistencyMetric> {
    await new Promise(resolve => setTimeout(resolve, 1500));

    const targetMetric = this.aiMetrics.find(m => m.promptSignature === promptSignature) || {
      id: `ai_${Date.now()}`,
      promptSignature,
      hallucinationRate: 0.15,
      explainabilityScore: 97.0,
      contextAdherence: 99.0,
      recommendationStability: 98.2
    };

    // Slight variance simulation is realistic and beautiful
    const variation = () => (Math.random() - 0.5) * 0.1;
    targetMetric.hallucinationRate = Math.max(0.01, targetMetric.hallucinationRate + variation() * 0.1);
    targetMetric.explainabilityScore = Math.min(100, Math.max(90, targetMetric.explainabilityScore + variation()));
    targetMetric.contextAdherence = Math.min(100, Math.max(90, targetMetric.contextAdherence + variation()));
    targetMetric.recommendationStability = Math.min(100, Math.max(90, targetMetric.recommendationStability + variation()));

    this.persistAi();
    return targetMetric;
  }

  public clearSecurityAudits() {
    this.audits = [...INITIAL_SECURITY_AUDITS];
    this.persistAudits();
  }
}

export const operationalTestingService = new OperationalTestingService();
export default operationalTestingService;
