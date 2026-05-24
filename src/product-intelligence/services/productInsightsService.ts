/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { telemetryService } from './telemetryService';
import { AutoInsight, FrictionEvent, OperationalFeedback, TelemetryEvent } from '../types';

export class ProductInsightsService {
  /**
   * Evaluates logged behavior signals, friction patterns and feedback metrics
   * to automatically generate reactive, actionable UX optimization recommendations.
   */
  public async compileInsights(): Promise<AutoInsight[]> {
    try {
      const frictionEvents = await telemetryService.getRecentFrictionEvents(50);
      const feedbackEntries = await telemetryService.getFeedbackEntries(20);
      const telemetryEvents = await telemetryService.getRecentTelemetryEvents(150);

      const generatedInsights: AutoInsight[] = [];
      const now = Date.now();

      // Heuristic 1: Rage Click patterns
      const rageClicks = frictionEvents.filter(f => f.type === 'rage_click');
      if (rageClicks.length > 0) {
        const areaFrictionCount: Record<string, number> = {};
        rageClicks.forEach(r => {
          areaFrictionCount[r.area] = (areaFrictionCount[r.area] || 0) + 1;
        });

        Object.entries(areaFrictionCount).forEach(([area, count]) => {
          if (count >= 2) {
            generatedInsights.push({
              id: `ins_service_rage_${area}_${now}`,
              timestamp: now,
              title: `Fricção Crítica: Cliques de Raiva em ${area.toUpperCase()}`,
              description: `Detectados ${count} episódios de cliques excessivos e repetidos nesta área. Indica frustração ou resposta demorada no dispositivo do técnico.`,
              type: 'friction',
              severity: 'warning',
              recommendedChange: `Revisar os ouvintes de clique e adicionar feedbacks táteis ou spinners instantâneos em ${area}.`,
              impactScore: 4,
              isImplemented: false
            });
          }
        });
      }

      // Heuristic 2: Low-engagement AI Adoption
      const aiEngagedCount = telemetryEvents.filter(e => e.name === 'ai_suggestion_engaged').length;
      const aiShownCount = telemetryEvents.filter(e => e.name === 'ai_suggestion_shown').length || 10;
      const aiAdoptionRatio = aiEngagedCount / aiShownCount;

      if (aiAdoptionRatio < 0.25) {
        generatedInsights.push({
          id: `ins_service_ai_adoption_${now}`,
          timestamp: now,
          title: 'Adoção Lenta do Módulo de IA Operacional',
          description: `Apenas ${(aiAdoptionRatio * 100).toFixed(0)}% das deduções e roteiros de IA gerados foram acionados nas frentes de operação de controle de vetores.`,
          type: 'ai_adoption',
          severity: 'opportunity',
          recommendedChange: 'Expor preenchimentos automáticos ou revisões de segurança recomendadas diretamente na calculadora de misturas.',
          impactScore: 3,
          isImplemented: false
        });
      }

      // Heuristic 3: Repeat UI validation blockers
      const inputErrors = frictionEvents.filter(f => f.type === 'repeat_error');
      if (inputErrors.length > 3) {
        generatedInsights.push({
          id: `ins_service_validation_friction_${now}`,
          timestamp: now,
          title: 'Atrito de Validação nos Formulários de Receita',
          description: 'Detectados erros repetitivos nas validações de pesagem. O operador de campo encontra dificuldades nos campos numéricos decimais.',
          type: 'performance',
          severity: 'warning',
          recommendedChange: 'Incorporar guias dinâmicas com limites recomendados com base no produto químico selecionado para prevenir preenchimentos inválidos.',
          impactScore: 5,
          isImplemented: false
        });
      }

      // Standard Baseline Opportunity
      generatedInsights.push({
        id: `ins_service_opt_fallback_${now}`,
        timestamp: now,
        title: 'Otimização: Pré-computação de receitas offline-ready',
        description: 'Técnicos em subsolos ou áreas rurais dependem integralmente da calculadora sem conexão confiável.',
        type: 'performance',
        severity: 'opportunity',
        recommendedChange: 'Adicionar armazenamento antecipado das 10 dosagens químicas mais recorrentes do tenant local.',
        impactScore: 5,
        isImplemented: true
      });

      return generatedInsights;
    } catch (e) {
      console.error('Error generating product insights on service:', e);
      return [];
    }
  }
}

export const productInsightsService = new ProductInsightsService();
export default productInsightsService;
