/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { telemetryService } from '../services/telemetryService';
import { OperationalArea } from '../types';

interface ClickRecord {
  timestamp: number;
  target: HTMLElement | null;
  x: number;
  y: number;
}

export function useFrictionDetection() {
  const location = useLocation();
  const recentClicksRef = useRef<ClickRecord[]>([]);
  const lastTrackedRageRef = useRef<Record<string, number>>({});

  // Map route paths to operational areas
  const getOperationalArea = useCallback((path: string): OperationalArea => {
    if (path.includes('calculator')) return OperationalArea.CALCULATOR;
    if (path.includes('financial')) return OperationalArea.FINANCIAL;
    if (path.includes('pops')) return OperationalArea.POPS;
    if (path.includes('inventory')) return OperationalArea.STOCKS;
    if (path.includes('ai')) return OperationalArea.AI_ASSISTANT;
    return OperationalArea.DASHBOARD;
  }, []);

  // Listen for rage clicks (5 clicks on the same area within 1200ms)
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const now = Date.now();
      
      // Store new click
      const currentClick: ClickRecord = {
        timestamp: now,
        target,
        x: e.clientX,
        y: e.clientY
      };
      
      recentClicksRef.current.push(currentClick);

      // Keep only clicks within last 1200ms
      recentClicksRef.current = recentClicksRef.current.filter(
        c => now - c.timestamp < 1200
      );

      const recentClicks = recentClicksRef.current;
      if (recentClicks.length >= 5) {
        // Evaluate similarity of clicks
        const first = recentClicks[0];
        const isCloseProximity = recentClicks.every(c => {
          const dx = Math.abs(c.x - first.x);
          const dy = Math.abs(c.y - first.y);
          return dx < 30 && dy < 30; // within 30 pixels
        });

        const targetId = target.id || target.className || 'unknown_node';

        if (isCloseProximity) {
          // Throttling rage click logs for same selector within 5s
          const lastTracked = lastTrackedRageRef.current[targetId] || 0;
          if (now - lastTracked > 5000) {
            lastTrackedRageRef.current[targetId] = now;
            
            const area = getOperationalArea(location.pathname);
            
            // Log to telemetry
            telemetryService.trackFriction(
              'rage_click',
              area,
              'high',
              {
                tagName: target.tagName,
                textContent: target.textContent?.slice(0, 30) || '',
                path: location.pathname,
                clicksCount: recentClicks.length
              },
              target.id || undefined,
              target.className || undefined
            );

            // Also fire a telemetry event for funnels
            telemetryService.trackEvent('friction_rage_click', {
              targetId,
              area,
              path: location.pathname
            });
            
            console.warn(`[Product Intelligence] Rage click detected on: ${targetId}`);
          }
        }
      }
    };

    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [location.pathname, getOperationalArea]);

  // Handle explicit errors (e.g., inside fetch catches, validation limits)
  const trackFormError = useCallback((fieldName: string, errorMessage: string, contextualData: Record<string, any> = {}) => {
    const area = getOperationalArea(location.pathname);
    
    telemetryService.trackFriction(
      'repeat_error',
      area,
      'medium',
      {
        fieldName,
        errorMessage,
        path: location.pathname,
        ...contextualData
      }
    );

    telemetryService.trackEvent('friction_error', {
      fieldName,
      errorMessage,
      area
    });
  }, [location.pathname, getOperationalArea]);

  // Track slow server responses or dynamic system latency
  const trackPerformanceLatency = useCallback((operationName: string, durationMs: number, limitThresholdMs = 2500) => {
    if (durationMs < limitThresholdMs) return;

    const area = getOperationalArea(location.pathname);
    
    telemetryService.trackFriction(
      'excessive_latency',
      area,
      'low',
      {
        operationName,
        durationMs,
        thresholdMs: limitThresholdMs,
        path: location.pathname
      }
    );
  }, [location.pathname, getOperationalArea]);

  return {
    trackFormError,
    trackPerformanceLatency
  };
}
