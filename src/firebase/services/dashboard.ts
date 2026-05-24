import { 
  createDocument, 
  queryDocuments, 
  subscribeCollection 
} from '../firestore';
import { DashboardMetric } from '@/types';

const PATH = 'dashboard_metrics';

/**
 * Caches a calculated KPI metric value in database
 */
export async function saveMetricSnapshot(key: string, value: number, period: string = 'mensal'): Promise<void> {
  const payload: Omit<DashboardMetric, 'id'> = {
    key,
    value,
    period,
    timestamp: new Date().toISOString()
  };
  await createDocument<DashboardMetric>(PATH, key, payload);
}

/**
 * Fetch all pre-aggregated dashboards KPI metrics
 */
export async function getDashboardMetrics(): Promise<DashboardMetric[]> {
  return await queryDocuments<DashboardMetric>(PATH, {
    orderByField: 'timestamp',
    orderDirection: 'desc'
  });
}

/**
 * Live updates of business summary counters and totals
 */
export function listenToDashboardMetrics(onUpdate: (metrics: DashboardMetric[]) => void): () => void {
  return subscribeCollection<DashboardMetric>(PATH, {
    orderByField: 'timestamp',
    orderDirection: 'desc'
  }, onUpdate);
}
