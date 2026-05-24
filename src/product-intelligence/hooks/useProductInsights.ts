/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { telemetryService } from '../services/telemetryService';
import { AutoInsight, FrictionEvent, TelemetryEvent, OperationalArea } from '../types';

export function useProductInsights() {
  const [insights, setInsights] = useState<AutoInsight[]>([]);
  const [loading, setLoading] = useState(false);

  const calculateInsights = useCallback(async () => {
    setLoading(true);
    try {
      const frictionEvents = await telemetryService.getRecentFrictionEvents(50);
      const feedbackEntries = await telemetryService.getFeedbackEntries(20);
      const telemetryEvents = await telemetryService.getRecentTelemetryEvents(150);

      const generatedInsights: AutoInsight[] = [];
      const now = Date.now();

      // Rule 1: Rage Click Friction Index Analysis
      const rageClicks = frictionEvents.filter(f => f.type === 'rage_click');
      if (rageClicks.length > 0) {
        // Group by element or area
        const areaFrictionCount: Record<string, number> = {};
        rageClicks.forEach(r => {
          areaFrictionCount[r.area] = (areaFrictionCount[r.area] || 0) + 1;
        });

        Object.entries(areaFrictionCount).forEach(([area, count]) => {
          if (count >= 2) {
            generatedInsights.push({
              id: `ins_rage_${area}_${now}`,
              timestamp: now,
              title: `Fricção Crítica: Cliques de Raiva em ${area.toUpperCase()}`,
              description: `Detectados ${count} episódios de cliques excessivos e repetidos nesta área. Indica lentidão na resposta ou elementos confusos que parecem clicáveis mas não respondem.`,
              type: 'friction',
              severity: 'warning',
              recommendedChange: `Revisar os ouvintes de clique e adicionar spinners de carregamento de alta visibilidade ou feedback tátil instantâneo ao acionar ações em ${area}.`,
              impactScore: 4,
              isImplemented: false
            });
          }
        });
      }

      // Rule 2: Low-engagement AI Adoption Gap
      const aiEngagedCount = telemetryEvents.filter(e => e.name === 'ai_suggestion_engaged').length;
      const aiShownCount = telemetryEvents.filter(e => e.name === 'ai_suggestion_shown').length || 10;
      const aiAdoptionRatio = aiEngagedCount / aiShownCount;

      if (aiAdoptionRatio < 0.25) {
        generatedInsights.push({
          id: `ins_ai_adoption_${now}`,
          timestamp: now,
          title: 'Baixo Engajamento com a IA Operacional',
          description: `Apenas ${(aiAdoptionRatio * 100).toFixed(0)}% das sugestões geradas por IA foram aproveitadas pelos técnicos e gestores. A visibilidade do módulo ou contexto das respostas pode estar abaixo do ideal.`,
          type: 'ai_adoption',
          severity: 'opportunity',
          recommendedChange: 'Expor sugestões de IA de forma nativa e inline no formulário de POPs ou na calculadora de dosagem ao invés de mantê-las ocultas em aba dedicada.',
          impactScore: 3,
          isImplemented: false
        });
      }

      // Rule 3: Form Operational Velocity Bottleneck (Validation errors)
      const inputErrors = frictionEvents.filter(f => f.type === 'repeat_error');
      if (inputErrors.length > 3) {
        generatedInsights.push({
          id: `ins_validation_friction_${now}`,
          timestamp: now,
          title: 'Carga Cognitiva Elevada no Preenchimento de Registros',
          description: 'Múltiplos erros de validação foram registrados nos formulários. Usuários enfrentando atrito em campos de números, pesagens ou dosagens.',
          type: 'performance',
          severity: 'warning',
          recommendedChange: 'Implementar máscara inteligente de input e fornecer sugestões de preenchimento automático calculadas dinamicamente com base no histórico do cliente.',
          impactScore: 5,
          isImplemented: false
        });
      }

      // Rule 4: High Feedback Saturation
      const lowRatings = feedbackEntries.filter(f => f.rating <= 3);
      if (lowRatings.length > 0) {
        generatedInsights.push({
          id: `ins_feedback_low_${now}`,
          timestamp: now,
          title: 'Alertas de Detecção UX de técnicos de campo',
          description: `Identificados feedbacks operacionais com notas inferiores a 3. Técnico relatou: "${lowRatings[0].feedbackText}"`,
          type: 'retention',
          severity: 'warning',
          recommendedChange: 'Implementar salvamento de rascunhos offline em segundo plano instantâneo para evitar qualquer perda de progresso durante a operação.',
          impactScore: 5,
          isImplemented: false
        });
      }

      // Standard Optimization Opportunity
      generatedInsights.push({
        id: `ins_opt_std_${now}`,
        timestamp: now,
        title: 'Oportunidade: Ativação Antecipada de Caching offline',
        description: 'Os dados operacionais de estoque e calculadora são atualizados com alta frequência. Um cache reativo offline-first estruturado melhoraria a velocidade de renderização primária.',
        type: 'performance',
        severity: 'opportunity',
        recommendedChange: 'Pré-carregar os 15 POPs mais utilizados nas últimas 4 semanas localmente para visualização instantânea sem necessidade de consulta transitória à rede.',
        impactScore: 4,
        isImplemented: true
      });

      setInsights(generatedInsights);
    } catch (e) {
      console.error('Failed to analyze product intelligence metrics', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleInsightImplemented = useCallback((id: string) => {
    setInsights(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, isImplemented: !item.isImplemented };
      }
      return item;
    }));
  }, []);

  useEffect(() => {
    calculateInsights();
  }, [calculateInsights]);

  return {
    insights,
    loading,
    refreshInsights: calculateInsights,
    toggleInsightImplemented
  };
}
