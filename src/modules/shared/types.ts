export interface MetricInsight {
  type: 'success' | 'warning' | 'info' | 'error';
  pattern: string;
  confidence: number;
  dataPoints: number;
}

export interface OperationalMetric {
  label: string;
  value: string | number;
  trend?: number;
  type?: 'neutral' | 'success' | 'warning' | 'error' | 'info';
  description?: string;
}
