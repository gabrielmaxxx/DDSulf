import { Quote, FinancialCost, Revenue, HistoricalInsight } from '@/types/database';

export type DashboardTimePeriod = 'today' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'all';

export interface DashboardKPI {
  key: string;
  title: string;
  value: number | string;
  changePercent?: number;
  trendDirection?: 'up' | 'down' | 'flat';
  status?: 'success' | 'warning' | 'error' | 'neutral';
  description?: string;
}

export interface OperationalSnapshot {
  activeServicesCount: number;
  pendingAllocationCount: number;
  reworkRatePercent: number;
  completedServicesCount: number;
  avgResponseTimeHours: number;
}

export interface FinancialAggregations {
  totalRevenue: number;
  totalCosts: number;
  ebitda: number;
  netMargin: number;
  marginPercent: number;
  averageTicket: number;
  customerLifetimeValue?: number;
}

export interface HistoricalTrendPoint {
  date: string; // ISO or label
  revenue: number;
  costs: number;
  marginPercent: number;
  servicesExecuted: number;
}

export interface AnomalyLog {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
}

export interface OperationalInsight {
  id: string;
  category: 'efficiency' | 'financial' | 'quality' | 'supply';
  title: string;
  recommendation: string;
  impactPercent?: number;
  confidenceScore: number;
  associatedDataPoints: number;
  timestamp: string;
}

export interface DashboardState {
  isOnline: boolean;
  timePeriod: DashboardTimePeriod;
  isSyncing: boolean;
  activePestFilter?: string;
  activeRegionFilter?: string;
}
