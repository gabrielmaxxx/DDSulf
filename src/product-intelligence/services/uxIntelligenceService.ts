/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { telemetryService } from './telemetryService';
import { OperationalArea } from '../types';

export class UXIntelligenceService {
  /**
   * Tracks repeating validation or operation errors which signify high cognitive friction.
   */
  public reportFormValidationError(
    fieldName: string,
    errorMessage: string,
    area: OperationalArea,
    context: Record<string, any> = {}
  ) {
    telemetryService.trackFriction(
      'repeat_error',
      area,
      'medium',
      {
        fieldName,
        errorMessage,
        ...context
      }
    );
  }

  /**
   * Captures rapid clicking sequences on elements that might not be responding or laggy.
   */
  public reportRageClicks(
    elementId: string,
    selector: string,
    area: OperationalArea,
    consecutiveClicks: number,
    context: Record<string, any> = {}
  ) {
    telemetryService.trackFriction(
      'rage_click',
      area,
      'high',
      {
        consecutiveClicks,
        ...context
      },
      elementId,
      selector
    );
  }

  /**
   * Evaluates if operations exceeded the user's focus expectancy.
   */
  public trackInteractiveLatency(
    operationName: string,
    durationMs: number,
    area: OperationalArea,
    criticalThresholdMs = 3000
  ) {
    if (durationMs > criticalThresholdMs) {
      telemetryService.trackFriction(
        'excessive_latency',
        area,
        durationMs > criticalThresholdMs * 2 ? 'high' : 'medium',
        {
          operationName,
          durationMs,
          thresholdLimitMs: criticalThresholdMs
        }
      );
    }
  }
}

export const uxIntelligenceService = new UXIntelligenceService();
export default uxIntelligenceService;
