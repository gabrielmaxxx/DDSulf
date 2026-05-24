// Unified DDSulf BI & Analytics System Foundation Export Portal
// Created as an Analytics-First, Mobile-First, Real-time Operations Center

// Types declarations
export * from './types';

// Services
export * from './services/analyticsEngine';
export * from './services/realtimeAnalytics';

// Subscription Socket manager
export * from './realtime/realtimeManager';

// Reactive state filters
export * from './filters/TimeRangeFilter';
export * from './filters/OperationalFilter';

// Custom design system charts
export * from './charts/AdaptiveAreaChart';
export * from './charts/PremiumLineChart';
export * from './charts/ComparativeBarChart';
export * from './charts/RhythmPieChart';

// Widgets
export * from './widgets/TicketAverageWidget';
export * from './widgets/ProductivityTracker';
export * from './widgets/ActiveJobsDensity';

// Insight & Alerts anomaly modules
export { InsightAlerts } from './insights/InsightAlerts';

// Telemetry design components
export * from './components/PremiumKpiGrid';
export * from './components/OperationalPanel';
export * from './components/MetricsHeader';

// Consumer hooks
export * from './hooks/useDashboardMetrics';
export * from './hooks/useRealtimeKPIs';
export * from './hooks/useOperationalInsights';
export * from './hooks/useHistoricalMetrics';
