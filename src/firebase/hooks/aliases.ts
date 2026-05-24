/**
 * Concrete domain aliases for high level real-time enterprise streams
 */

import { useCollection } from './useCollection';
import { useDocument } from './useDocument';
import { QueryOptions } from '../types';
import { Client, Quote, ServiceExecution, FinancialCost, Product, POP } from '../types/enterprise';

/**
 * Enterprise query hook with direct type safety mapping
 */
export function useFirestoreQuery<T>(collectionName: string, options?: QueryOptions) {
  return useCollection<T>(collectionName, options);
}

/**
 * Unified alias for real-time collections subscription
 */
export function useRealtimeCollection<T>(collectionName: string, options?: QueryOptions) {
  return useCollection<T>(collectionName, options);
}

/**
 * Hook targeting live Operational Schedules, Procedures (POPs) and Executed Services data
 */
export function useOperationalData() {
  const services = useCollection<ServiceExecution>('services');
  const pops = useCollection<POP>('pops');

  return {
    activeServices: services.data,
    serviceLoading: services.loading,
    serviceError: services.error,
    technicalPops: pops.data,
    popLoading: pops.loading
  };
}

/**
 * Hook tracking financial records (cost categories & billing revenues)
 */
export function useFinancialData() {
  const costs = useCollection<FinancialCost>('financial_costs');
  const revenues = useCollection<any>('revenues');

  return {
    expenses: costs.data,
    revenues: revenues.data,
    loading: costs.loading || revenues.loading,
    error: costs.error || revenues.error
  };
}

/**
 * Real-time custom indicators stream and diagnostic timelines
 */
export function useAnalyticsData() {
  const metrics = useCollection<any>('dashboard_metrics');
  const insights = useCollection<any>('historical_insights');

  return {
    kpis: metrics.data,
    insights: insights.data,
    loading: metrics.loading || insights.loading,
    error: metrics.error || insights.error
  };
}
