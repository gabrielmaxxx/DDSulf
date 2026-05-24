/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { telemetryService } from './telemetryService';
import { TelemetryEventName } from '../types';

export class BehaviorAnalyticsService {
  /**
   * Tracks standard user interface click actions with contextual telemetry labels.
   */
  public trackAction(actionName: string, actionLabel: string, extraData: Record<string, any> = {}) {
    telemetryService.trackEvent(TelemetryEventName.INTERACTION_CLICK, {
      actionName,
      actionLabel,
      ...extraData
    });
  }

  /**
   * Dispatches the start of a multi-step user task or inspection wizard.
   */
  public startWorkflow(workflowName: string, metadata: Record<string, any> = {}) {
    telemetryService.trackEvent(TelemetryEventName.WORKFLOW_START, {
      workflowName,
      startedAt: Date.now(),
      ...metadata
    });
  }

  /**
   * Dispatches a single step advancement inside a multi-step workflow.
   */
  public trackWorkflowStep(workflowName: string, stepNumber: number, stepLabel: string, metadata: Record<string, any> = {}) {
    telemetryService.trackEvent(TelemetryEventName.WORKFLOW_STEP, {
      workflowName,
      stepNumber,
      stepLabel,
      ...metadata
    });
  }

  /**
   * Concludes a multi-step task, tracking overall time elapsed if provided.
   */
  public completeWorkflow(workflowName: string, durationMs?: number, metadata: Record<string, any> = {}) {
    telemetryService.trackEvent(TelemetryEventName.WORKFLOW_COMPLETE, {
      workflowName,
      completedAt: Date.now(),
      durationMs,
      ...metadata
    }, durationMs);
  }

  /**
   * Dispatches workflow abandonment when a user cancels an ongoing wizard.
   */
  public abandonWorkflow(workflowName: string, reason: string, stepNumber: number, metadata: Record<string, any> = {}) {
    telemetryService.trackEvent(TelemetryEventName.WORKFLOW_ABANDON, {
      workflowName,
      reason,
      stepNumber,
      abandonedAt: Date.now(),
      ...metadata
    });
  }
}

export const behaviorAnalyticsService = new BehaviorAnalyticsService();
export default behaviorAnalyticsService;
