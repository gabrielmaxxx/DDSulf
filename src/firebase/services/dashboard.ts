import { 
  createDocument, 
  queryDocuments, 
  subscribeCollection 
} from '../firestore';
import { DashboardMetric } from '@/types';

const PATH = 'dashboard_metrics';

/**
 * Caches a calculated KPI metric value in database in tenant scope
 */
export async function saveMetricSnapshot(empresaId: string | undefined, key: string, value?: number, period: string = 'mensal'): Promise<void> {
  const targetKey = value !== undefined ? key : (empresaId as string);
  const targetValue = value !== undefined ? value : (key as any);
  const targetEmpresa = value !== undefined ? empresaId : undefined;
  
  const payload: Omit<DashboardMetric, 'id'> = {
    key: targetKey,
    value: targetValue,
    period,
    timestamp: new Date().toISOString()
  };
  await createDocument<DashboardMetric>(PATH, targetKey, payload, targetEmpresa);
}

/**
 * Fetch all pre-aggregated dashboards KPI metrics in tenant scope
 */
export async function getDashboardMetrics(empresaId?: string): Promise<DashboardMetric[]> {
  return await queryDocuments<DashboardMetric>(PATH, {
    orderByField: 'timestamp',
    orderDirection: 'desc'
  }, empresaId);
}

/**
 * Live updates of business summary counters and totals in tenant scope
 */
export function listenToDashboardMetrics(empresaId: string | undefined, onUpdate: (metrics: DashboardMetric[]) => void): () => void;
export function listenToDashboardMetrics(onUpdate: (metrics: DashboardMetric[]) => void): () => void;
export function listenToDashboardMetrics(arg1: any, arg2?: any): () => void {
  const empresaId = typeof arg1 === 'string' ? arg1 : undefined;
  const onUpdate = typeof arg1 === 'function' ? arg1 : arg2;
  return subscribeCollection<DashboardMetric>(PATH, {
    orderByField: 'timestamp',
    orderDirection: 'desc'
  }, onUpdate, undefined, empresaId);
}
