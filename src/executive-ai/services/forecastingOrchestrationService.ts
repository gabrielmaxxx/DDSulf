/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { ForecastingMetric } from '../types';

export class ForecastingOrchestrationService {
  /**
   * Generates dynamic multi-factor projections representing realistic operational growth vectors.
   */
  public generateForecastProjections(baseRevenue: number, targetStabilityRate: number): ForecastingMetric[] {
    const months = ['Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    return months.map((month, idx) => {
      const stepFactor = idx + 1;
      const compoundModifier = Math.pow(1 + 0.045, stepFactor); // 4.5% compound index
      
      const projectedRevenue = Math.round(baseRevenue * compoundModifier);
      const riskUncertaintyValue = Math.round(projectedRevenue * 0.12); // 12% uncertainty spread

      return {
        periodLabel: `${month} 2026`,
        projectedRevenue,
        worstScenarioRevenue: projectedRevenue - riskUncertaintyValue,
        bestScenarioRevenue: projectedRevenue + Math.round(riskUncertaintyValue * 1.5),
        projectedPopsCount: Math.round(450 + stepFactor * 32),
        overheadEstimate: Math.round(25000 + stepFactor * 1200)
      };
    });
  }
}

export const forecastingOrchestrationService = new ForecastingOrchestrationService();
export default forecastingOrchestrationService;
