/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { telemetryService } from '../services/telemetryService';
import { TelemetryEventName } from '../types';

export function useBehaviorAnalytics() {
  const location = useLocation();
  const pageStartTimeRef = useRef<number>(Date.now());
  const activeFlowsRef = useRef<Map<string, { start: number; lastStep: string }>>(new Map());

  // Page View and Duration Tracking on leave
  useEffect(() => {
    // Record page enter
    const currentPath = location.pathname;
    pageStartTimeRef.current = Date.now();
    
    telemetryService.trackEvent(TelemetryEventName.PAGE_VIEW, {
      path: currentPath,
      referrer: document.referrer || 'direct',
      title: document.title,
    });

    return () => {
      // Record page leave with total duration spent (helps measure UX cognitive tax)
      const duration = Date.now() - pageStartTimeRef.current;
      telemetryService.trackEvent(`${TelemetryEventName.PAGE_VIEW}_completed`, {
        path: currentPath,
      }, duration);
    };
  }, [location.pathname]);

  // Track regular element clicks / actions
  const trackAction = useCallback((elementId: string, label: string, extraMetadata: Record<string, any> = {}) => {
    telemetryService.trackEvent(TelemetryEventName.INTERACTION_CLICK, {
      elementId,
      label,
      path: location.pathname,
      ...extraMetadata
    });
  }, [location.pathname]);

  // Start complete business operational processes
  const startWorkflow = useCallback((flowName: string, initialMetadata: Record<string, any> = {}) => {
    activeFlowsRef.current.set(flowName, {
      start: Date.now(),
      lastStep: 'start'
    });

    telemetryService.trackEvent(TelemetryEventName.WORKFLOW_START, {
      flowName,
      path: location.pathname,
      ...initialMetadata
    });
  }, [location.pathname]);

  // Transition between multi-stage workflows
  const stepWorkflow = useCallback((flowName: string, stepName: string, stepMetadata: Record<string, any> = {}) => {
    const flow = activeFlowsRef.current.get(flowName);
    if (!flow) return;

    const stepDuration = Date.now() - flow.start;
    flow.lastStep = stepName;

    telemetryService.trackEvent(TelemetryEventName.WORKFLOW_STEP, {
      flowName,
      stepName,
      stepDurationMs: stepDuration,
      path: location.pathname,
      ...stepMetadata
    });
  }, [location.pathname]);

  // Successfully exit workflow
  const completeWorkflow = useCallback((flowName: string, finalMetadata: Record<string, any> = {}) => {
    const flow = activeFlowsRef.current.get(flowName);
    if (!flow) return;

    const totalDuration = Date.now() - flow.start;
    activeFlowsRef.current.delete(flowName);

    telemetryService.trackEvent(TelemetryEventName.WORKFLOW_COMPLETE, {
      flowName,
      totalDurationMs: totalDuration,
      path: location.pathname,
      ...finalMetadata
    }, totalDuration);
  }, [location.pathname]);

  // User abandoned the operational workflow
  const abandonWorkflow = useCallback((flowName: string, reason: string, contextualData: Record<string, any> = {}) => {
    const flow = activeFlowsRef.current.get(flowName);
    if (!flow) return;

    const sessionDuration = Date.now() - flow.start;
    activeFlowsRef.current.delete(flowName);

    telemetryService.trackEvent(TelemetryEventName.WORKFLOW_ABANDON, {
      flowName,
      lastStep: flow.lastStep,
      reason,
      abandonDurationMs: sessionDuration,
      path: location.pathname,
      ...contextualData
    });
  }, [location.pathname]);

  return {
    trackAction,
    startWorkflow,
    stepWorkflow,
    completeWorkflow,
    abandonWorkflow
  };
}
