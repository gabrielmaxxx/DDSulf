import { useDashboardMetrics as useFirebaseDashboardMetrics } from '@/firebase/hooks/useDashboardMetrics';

export function useDashboardMetrics() {
  const data = useFirebaseDashboardMetrics();
  return {
    activeQuotes: data.activeQuotesCount,
    completedServices: data.completedServicesCount,
    understockWarnings: data.warningsCount,
    isLoading: data.loading,
    error: data.error,
    refresh: data.refresh
  };
}

export default useDashboardMetrics;
