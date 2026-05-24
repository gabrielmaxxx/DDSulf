/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { StrategicDecisionReasoning, DecisionGoal } from '../types';

export class StrategicReasoningService {
  private reasoningModels: StrategicDecisionReasoning[] = [];

  constructor() {
    this.initializeReasoningScenarios();
  }

  private initializeReasoningScenarios() {
    this.reasoningModels = [
      {
        id: 'reason_pesticide_limit',
        goal: DecisionGoal.SAFETY_COMPLIANCE,
        targetObjective: 'Restringir Piretróides Sintéticos em Áreas Próximas à Silos Alimentares',
        computedRiskPercent: 12,
        factorsRanked: [
          { factorName: 'Contaminação de Lotes Agrícolas', impactWeight: 0.95, observedState: 'Crítico se próximo a grãos' },
          { factorName: 'Tempo de Carência Sanitária', impactWeight: 0.8, observedState: 'Teto rígido de 72 horas' },
          { factorName: 'Satisfação de Auditoria Anvisa', impactWeight: 0.75, observedState: 'Selo Prata sob risco' }
        ],
        suggestedPath: 'Substituição por barreira mecânica ativa e biodefensivos de desinfecção biológica lenta.',
        reasoningRationale: 'Análise de múltiplos dados cruzados confirma que o risco de contaminação cruzada sobressai amplamente o custo de barreira biológica. A conformidade regulatória evita sanções graves do Ministério da Saúde.'
      },
      {
        id: 'reason_franchise_expansion',
        goal: DecisionGoal.ORGANIZATIONAL_SCALE,
        targetObjective: 'Rollout de Filial Franquia na Serra Gaúcha',
        computedRiskPercent: 34,
        factorsRanked: [
          { factorName: 'Retorno sobre Licenças SaaS', impactWeight: 0.85, observedState: 'Margem estimada superior a 45%' },
          { factorName: 'Dificuldade de Cadastro de Equipes', impactWeight: 0.6, observedState: 'Média de 4 dias úteis' },
          { factorName: 'Infraestrutura de Rede e Sinal', impactWeight: 0.5, observedState: 'Instabilidade rural contornada por suporte offline' }
        ],
        suggestedPath: 'Aprovação com modelo SaaS Professional contendo habilitador PWA completo.',
        reasoningRationale: 'O isolamento de banco multi-tenant protege concorrentes do setor vitivinícola enquanto consolida o faturamento. O suporte offline contorna fragilidades de telecomunicação na Serra, garantindo integridade.'
      }
    ];
  }

  public getScenarios(): StrategicDecisionReasoning[] {
    return this.reasoningModels;
  }

  public registerCustomScenario(scenario: Omit<StrategicDecisionReasoning, 'id'>): StrategicDecisionReasoning {
    const fresh: StrategicDecisionReasoning = {
      ...scenario,
      id: `custom_reason_${Date.now()}`
    };
    this.reasoningModels.unshift(fresh);
    return fresh;
  }
}

export const strategicReasoningService = new StrategicReasoningService();
export default strategicReasoningService;
