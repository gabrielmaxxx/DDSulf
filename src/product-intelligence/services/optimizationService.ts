/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { telemetryService } from './telemetryService';
import { Experiment, OperationalArea } from '../types';

export class OptimizationService {
  private activeExperiments: Experiment[] = [];

  constructor() {
    this.initializeBaselineExperiments();
  }

  private initializeBaselineExperiments() {
    this.activeExperiments = [
      {
        id: 'exp_smart_dosing',
        name: 'Calculadora Simplificada (Smart Dosing)',
        description: 'Variação de interface com menos campos obrigatórios na etapa inicial do cálculo de químicos.',
        targetArea: OperationalArea.CALCULATOR,
        isActive: true,
        variants: [
          { id: 'control', name: 'Original', description: 'Formulário completo tradicional', rolloutPercentage: 50 },
          { id: 'variant_a', name: 'Layout Rápido', description: 'Duas perguntas mestre e preenchimento de sobras automático por IA', rolloutPercentage: 50 }
        ],
        metrics: {
          clicks: { control: 0, variant_a: 0 },
          conversions: { control: 0, variant_a: 0 },
          totalSessions: { control: 0, variant_a: 0 }
        }
      }
    ];
  }

  /**
   * Evaluates and returns the appropriate feature experiment variant for a given user segment.
   */
  public selectVariantForUser(experimentId: string, userId: string): string {
    const exp = this.activeExperiments.find(e => e.id === experimentId);
    if (!exp || !exp.isActive) return 'control';

    // Consistent hashing variant selection based on userId string to prevent flickering
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const bucket = Math.abs(hash) % 100;

    let cumulativePercentage = 0;
    for (const variant of exp.variants) {
      cumulativePercentage += variant.rolloutPercentage;
      if (bucket < cumulativePercentage) {
        return variant.id;
      }
    }

    return 'control';
  }

  /**
   * Commits metric increments on dynamic experiment evaluations.
   */
  public trackExperimentActivity(experimentId: string, variantId: string, metricType: 'click' | 'conversion' | 'session') {
    const exp = this.activeExperiments.find(e => e.id === experimentId);
    if (!exp) return;

    if (metricType === 'click') {
      exp.metrics.clicks[variantId] = (exp.metrics.clicks[variantId] || 0) + 1;
    } else if (metricType === 'conversion') {
      exp.metrics.conversions[variantId] = (exp.metrics.conversions[variantId] || 0) + 1;
    } else if (metricType === 'session') {
      exp.metrics.totalSessions[variantId] = (exp.metrics.totalSessions[variantId] || 0) + 1;
    }

    telemetryService.trackEvent('experiment_metrics_updated', {
      experimentId,
      variantId,
      metricType,
      snapshot: exp.metrics
    });
  }

  public getExperiments(): Experiment[] {
    return this.activeExperiments;
  }
}

export const optimizationService = new OptimizationService();
export default optimizationService;
