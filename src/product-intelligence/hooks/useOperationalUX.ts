/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { telemetryService } from '../services/telemetryService';
import { OperationalArea } from '../types';

export interface UXDimensions {
  viewportWidth: number;
  viewportHeight: number;
  orientation: 'portrait' | 'landscape';
  isMobileSize: boolean;
}

export function useOperationalUX() {
  const location = useLocation();
  const [dimensions, setDimensions] = useState<UXDimensions>({
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
    isMobileSize: window.innerWidth < 768
  });

  const entryTimeRef = useRef<number>(Date.now());
  const activeSectionRef = useRef<string>(location.pathname);

  // Map paths to area
  const getOperationalArea = useCallback((path: string): OperationalArea => {
    if (path.includes('calculator')) return OperationalArea.CALCULATOR;
    if (path.includes('financial')) return OperationalArea.FINANCIAL;
    if (path.includes('pops')) return OperationalArea.POPS;
    if (path.includes('inventory')) return OperationalArea.STOCKS;
    if (path.includes('ai')) return OperationalArea.AI_ASSISTANT;
    return OperationalArea.DASHBOARD;
  }, []);

  // Monitor resize operations (Responsive layout audit)
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const orientation = width > height ? 'landscape' : 'portrait';
      const isMobile = width < 768;

      setDimensions({
        viewportWidth: width,
        viewportHeight: height,
        orientation,
        isMobileSize: isMobile
      });

      // Track extreme layouts which could cause clipping or scrolling complexity
      if (width < 320 || height < 400) {
        const area = getOperationalArea(location.pathname);
        telemetryService.trackFriction(
          'abandonment',
          area,
          'low',
          {
            width,
            height,
            issue: 'extreme_viewport_restriction',
            path: location.pathname
          }
        );
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [location.pathname, getOperationalArea]);

  // Track dwell time on screen changes (User Flow Friction mapping)
  useEffect(() => {
    const previousTime = entryTimeRef.current;
    const previousSection = activeSectionRef.current;
    const now = Date.now();
    const durationSec = Math.round((now - previousTime) / 1000);

    // Save previous section metrics before updating
    if (durationSec > 1) {
      const area = getOperationalArea(previousSection);
      telemetryService.trackEvent('page_dwell_time', {
        section: previousSection,
        area,
        durationSeconds: durationSec,
        viewportWidth: window.innerWidth
      });
    }

    // Reset for current screen entry
    entryTimeRef.current = now;
    activeSectionRef.current = location.pathname;
  }, [location.pathname, getOperationalArea]);

  // Record direct feature interactivity speeds
  const trackInteractivityScore = useCallback((actionName: string, durationMs: number) => {
    const area = getOperationalArea(location.pathname);
    
    // Feed telemetry event
    telemetryService.trackEvent('user_interaction_latency', {
      actionName,
      durationMs,
      area,
      status: durationMs > 300 ? 'slow' : 'fast'
    });

    // If extremely sluggish micro-interaction, warning score
    if (durationMs > 800) {
      telemetryService.trackFriction(
        'excessive_latency',
        area,
        'medium',
        {
          actionName,
          durationMs,
          description: 'Experiência de rolamento ou clique com atraso significativo'
        }
      );
    }
  }, [location.pathname, getOperationalArea]);

  return {
    dimensions,
    trackInteractivityScore,
    currentArea: getOperationalArea(location.pathname)
  };
}
