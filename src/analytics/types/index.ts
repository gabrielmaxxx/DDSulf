/**
 * DDSulf Business Intelligence & Operational Analytics TypeScript Foundation
 */

export type AnalyticalPeriod = '7d' | '30d' | '90d';

export interface KPIMetric {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  changePercentage: number;
  format: 'number' | 'percent' | 'currency';
  status: 'positive' | 'neutral' | 'critical';
  description: string;
}

export interface HistoricalDataPoint {
  periodLabel: string;
  revenue: number;
  costs: number;
  profit: number;
  margin: number;
  servicesVolume: number;
}

export interface ForecastingPoint {
  periodLabel: string;
  projectedRevenue: number;
  projectedMargin: number;
  projectedProfit: number;
  confidenceLowerLimit: number;
  confidenceUpperLimit: number;
}

export interface CompareSeries {
  seriesName: string;
  data: HistoricalDataPoint[];
}

export interface OperationalKPI {
  key: string;
  name: string;
  value: number;
  previousValue: number;
  changePercent: number;
  unit: 'currency' | 'percent' | 'count' | 'hours';
  category: 'financial' | 'operational' | 'customer';
  description: string;
}

export interface ServiceProfitability {
  serviceId: string;
  serviceName: string;
  revenue: number;
  costTotal: number;
  netProfit: number;
  marginPercent: number;
  technicalHours: number;
}

export interface ChurnRiskIndicator {
  customerId: string;
  customerName: string;
  riskScore: number; // 0..100
  lastActivityDays: number;
  contractValue: number;
  predictedAction: string;
}

export interface HistoricalForecast {
  period: string; // e.g., 'Jan', 'Feb'
  actualValue: number;
  forecastedValue: number;
  confidenceIntervalLower: number;
  confidenceIntervalUpper: number;
}

export interface DecisionInsight {
  id: string;
  timestamp: string;
  category: 'anomaly' | 'profitability' | 'scheduling' | 'pesticide';
  score: number; // 0..100 (severity / priority)
  title: string;
  description: string;
  actionSuggested: string;
  isApplied: boolean;
}
