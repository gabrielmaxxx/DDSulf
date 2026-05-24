/**
 * DDSulf Operational AI & Contextual Intelligence Unified Types
 */

export interface SystemCoreContext {
  activeRole: string;
  userName: string;
  financialSettings?: {
    costPerHour: number;
    costPerKm: number;
    minimumMargin: number;
    baseOperationalCost: number;
  };
  metrics?: {
    totalRevenue: number;
    totalCosts: number;
    averageMargin: number;
    serviceVolume: number;
    syncLatencyMs?: number;
    stalledDraftsCount?: number;
  };
  targetQuote?: {
    pestType: string;
    environmentType: string;
    areaSize: number;
    suggestedPrice: number;
    estimatedCost: number;
    estimatedMargin: number;
  };
  recentLogsCount?: number;
}

export type InsightCategory = 'financial' | 'operations' | 'workflow' | 'analytics' | 'risk';

export interface AIInsight {
  id: string;
  category: InsightCategory;
  title: string;
  description: string;
  confidence: number; // Percentage: e.g. 0.92
  impact: 'positive' | 'neutral' | 'critical' | 'alert';
  actionableSuggestion?: string;
  timestamp: number;
}

export interface AIRecommendation {
  id: string;
  category: InsightCategory;
  title: string;
  description: string;
  actionPayload?: Record<string, any>;
  impactEstimate: string; // e.g. "+R$1.200/mês", "+4% margem"
  rationalization: string;
  dismissed: boolean;
  score: number; // Prioritization score
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: number;
}

export interface AISessionMemory {
  sessionId: string;
  messages: AIChatMessage[];
  lastContextSync: number;
}
