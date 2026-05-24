/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { telemetryService } from '../services/telemetryService';
import { TelemetryEventName, ExperimentVariant } from '../types';

// Pre-defined premium feature flags
const FEATURE_FLAGS_KEY = 'ddsulf_feature_rollouts';

export interface FeatureFlagConfig {
  id: string;
  name: string;
  isEnabled: boolean;
  experimentVariant: 'control' | 'variant_a' | 'variant_b';
}

const DEFAULT_FLAGS: FeatureFlagConfig[] = [
  { id: 'ai-auditor', name: 'IA Assistente de Auditoria em POPs', isEnabled: true, experimentVariant: 'variant_b' },
  { id: 'financial-insights', name: 'Graficos Auto-Predcritivos Financeiros', isEnabled: true, experimentVariant: 'variant_a' },
  { id: 'offline-reconciliation', name: 'Auto-Sincronizacao em Segundo Plano', isEnabled: true, experimentVariant: 'control' },
];

export function useFeatureAdoption() {
  const [flags, setFlags] = useState<FeatureFlagConfig[]>(() => {
    try {
      const stored = localStorage.getItem(FEATURE_FLAGS_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_FLAGS;
    } catch {
      return DEFAULT_FLAGS;
    }
  });

  const getFlag = useCallback((id: string): FeatureFlagConfig | undefined => {
    return flags.find(f => f.id === id);
  }, [flags]);

  const isFeatureEnabled = useCallback((id: string): boolean => {
    const f = getFlag(id);
    return f ? f.isEnabled : false;
  }, [getFlag]);

  const getVariant = useCallback((id: string): 'control' | 'variant_a' | 'variant_b' => {
    const f = getFlag(id);
    return f ? f.experimentVariant : 'control';
  }, [getFlag]);

  // Update flags locally & trigger synchronization telemetry audit
  const updateFlag = useCallback((id: string, isEnabled: boolean, variant?: 'control' | 'variant_a' | 'variant_b') => {
    setFlags(prev => {
      const updated = prev.map(f => {
        if (f.id === id) {
          return {
            ...f,
            isEnabled,
            experimentVariant: variant !== undefined ? variant : f.experimentVariant
          };
        }
        return f;
      });
      localStorage.setItem(FEATURE_FLAGS_KEY, JSON.stringify(updated));
      
      // Track the rollout setting adjustment to train contextual algorithms
      telemetryService.trackEvent(TelemetryEventName.FEATURE_ROLLOUT_EVALUATED, {
        featureId: id,
        isEnabled,
        assignedVariant: variant || 'current'
      });

      return updated;
    });
  }, []);

  // Track operational metrics linked to feature adoption
  const trackFeatureEngagement = useCallback((featureId: string, actionType: 'click' | 'focus' | 'interacted') => {
    telemetryService.trackEvent(TelemetryEventName.AI_SUGGESTION_ENGAGED, {
      featureId,
      action: actionType,
      variant: getVariant(featureId)
    });
  }, [getVariant]);

  return {
    flags,
    isFeatureEnabled,
    getVariant,
    updateFlag,
    trackFeatureEngagement
  };
}
