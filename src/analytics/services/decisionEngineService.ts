/**
 * PestFlow Operational Decision Engine & Alert System
 * Parses operational conditions and automatically issues triggers, anomalies, and chemical treatments optimizations.
 */

import { DecisionInsight } from '../types';

class DecisionEngineService {
  private insights: DecisionInsight[] = [];

  constructor() {
    this.seedBaselineInsights();
  }

  private seedBaselineInsights() {
    this.insights = [
      {
        id: 'ins_01',
        timestamp: new Date().toISOString(),
        category: 'profitability',
        score: 87,
        title: 'Baixa Rentabilidade em Hortas na Regional Erechim',
        description: 'Custos de deslocamento agrícola estão ultrapassando a margem de 65% acordada no SLA da franquia.',
        actionSuggested: 'Reajustar rampa tarifária operacional em de 12.5% ou agrupar ordens no mesmo quadrante geográfico.',
        isApplied: false
      },
      {
        id: 'ins_02',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        category: 'pesticide',
        score: 95,
        title: 'Alerta de Sazonalidade: Umidade Elevada em Passo Fundo',
        description: 'Silos de trigo estão com propensão de 84% de infestação de gorgulho devido à colheita úmida.',
        actionSuggested: 'Mobilizar preventivamente fipronil líquido e agendar vistorias técnicas imediatas nos maiores graneleiros.',
        isApplied: false
      },
      {
        id: 'ins_03',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        category: 'scheduling',
        score: 64,
        title: 'Concorrência de Agendamentos sob Temperatura Alta',
        description: 'Previsão de 34°C em Santa Maria deve disparar infestação de baratas germânicas nas próximas 72 horas.',
        actionSuggested: 'Notificar carteira de clientes comerciais sobre o plano de dedetização preventiva de verão.',
        isApplied: false
      }
    ];
  }

  public getInsights(onlyUnapplied = false): DecisionInsight[] {
    if (onlyUnapplied) {
      return this.insights.filter(i => !i.isApplied);
    }
    return [...this.insights];
  }

  /**
   * Safe marks an automatic architectural insight as acknowledged/applied
   */
  public applyInsight(id: string): boolean {
    const insight = this.insights.find(i => i.id === id);
    if (!insight) return false;

    insight.isApplied = true;
    return true;
  }

  /**
   * Dynamically triggers an emergency or business-driven advisory node
   */
  public triggerInsight(
    category: 'anomaly' | 'profitability' | 'scheduling' | 'pesticide',
    title: string,
    description: string,
    action: string,
    score: number = 50
  ): DecisionInsight {
    const fresh: DecisionInsight = {
      id: `ins_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      category,
      score: Math.max(0, Math.min(100, score)),
      title,
      description,
      actionSuggested: action,
      isApplied: false
    };

    this.insights.unshift(fresh);
    return fresh;
  }
}

export const decisionEngineService = new DecisionEngineService();
export default decisionEngineService;
