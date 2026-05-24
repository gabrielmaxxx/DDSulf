/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum TelemetryEventName {
  PAGE_VIEW = 'page_view',
  INTERACTION_CLICK = 'interaction_click',
  WORKFLOW_START = 'workflow_start',
  WORKFLOW_STEP = 'workflow_step',
  WORKFLOW_COMPLETE = 'workflow_complete',
  WORKFLOW_ABANDON = 'workflow_abandon',
  FRICTION_RAGE_CLICK = 'friction_rage_click',
  FRICTION_ERROR = 'friction_error',
  AI_SUGGESTION_SHOWN = 'ai_suggestion_shown',
  AI_SUGGESTION_ENGAGED = 'ai_suggestion_engaged',
  FEATURE_ROLLOUT_EVALUATED = 'feature_rollout_evaluated',
  FEEDBACK_SUBMITTED = 'feedback_submitted',
}

export enum OperationalArea {
  DASHBOARD = 'dashboard',
  CALCULATOR = 'calculator',
  FINANCIAL = 'financial',
  POPS = 'pops',
  STOCKS = 'stocks',
  AI_ASSISTANT = 'ai_assistant',
}

export interface TelemetryEvent {
  id: string;
  name: TelemetryEventName | string;
  sessionId: string;
  userId: string;
  userRole?: string;
  tenantId: string;
  timestamp: number; // ISO epoch ms
  durationMs?: number;
  metadata: Record<string, any>;
  isOffline: boolean;
  syncedAt?: number;
}

export interface FrictionEvent {
  id: string;
  sessionId: string;
  userId: string;
  tenantId: string;
  timestamp: number;
  elementId?: string;
  selector?: string;
  area: OperationalArea;
  type: 'rage_click' | 'repeat_error' | 'abandonment' | 'excessive_latency';
  severity: 'low' | 'medium' | 'high';
  context: Record<string, any>;
}

export interface OperationalFeedback {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  tenantId: string;
  timestamp: number;
  area: OperationalArea;
  rating: number; // 1-5 scale
  feedbackText: string;
  associatedFrictionEventId?: string;
  isAddressed: boolean;
  systemResponse?: string;
}

export interface ExperimentVariant {
  id: string; // 'control' | 'variant_a' | 'variant_b'
  name: string;
  description: string;
  rolloutPercentage: number;
}

export interface Experiment {
  id: string;
  name: string;
  description: string;
  targetArea: OperationalArea;
  isActive: boolean;
  variants: ExperimentVariant[];
  metrics: {
    clicks: Record<string, number>;
    conversions: Record<string, number>;
    totalSessions: Record<string, number>;
  };
}

export interface ProductHealthScore {
  timestamp: number;
  overallScore: number; // 0-100
  dimensions: {
    engagement: number; // based on active days & events
    completionRate: number; // funnel completions
    frictionIndex: number; // low rage clicks & low errors
    adoptionRate: number; // usage of high-value tools e.g. calculator, IA
  };
}

export interface AutoInsight {
  id: string;
  timestamp: number;
  title: string;
  description: string;
  type: 'performance' | 'friction' | 'ai_adoption' | 'retention';
  severity: 'info' | 'warning' | 'opportunity';
  recommendedChange: string;
  impactScore: number; // 1-5
  isImplemented: boolean;
}
