import { 
  createDocument, 
  queryDocuments, 
  subscribeCollection 
} from '../firestore';
import { DashboardMetric } from '@/types';
import { DEFAULT_EMPRESA_ID } from '../../tenant';

const PATH = 'dashboard_metrics';

/**
 * Caches a calculated KPI metric value in database in tenant scope
 */
export async function saveMetricSnapshot(empresaId: string = DEFAULT_EMPRESA_ID, key: string, value: number, period: string = 'mensal'): Promise<void> {
  // TODO(fase-2): substituir por empresaId extraído do custom claim do token
  const payload: Omit<DashboardMetric, 'id'> = {
    key,
    value,
    period,
    timestamp: new Date().toISOString()
  };
  await createDocument<DashboardMetric>(PATH, key, payload, empresaId);
}

/**
 * Fetch all pre-aggregated dashboards KPI metrics in tenant scope
 */
export async function getDashboardMetrics(empresaId: string = DEFAULT_EMPRESA_ID): Promise<DashboardMetric[]> {
  // TODO(fase-2): substituir por empresaId extraído do custom claim do token
  return await queryDocuments<DashboardMetric>(PATH, {
    orderByField: 'timestamp',
    orderDirection: 'desc'
  }, empresaId);
}

/**
 * Live updates of business summary counters and totals in tenant scope
 */
export function listenToDashboardMetrics(empresaId: string = DEFAULT_EMPRESA_ID, onUpdate: (metrics: DashboardMetric[]) => void): () => void {
  // TODO(fase-2): substituir por empresaId extraído do custom claim do token
  return subscribeCollection<DashboardMetric>(PATH, {
    orderByField: 'timestamp',
    orderDirection: 'desc'
  }, onUpdate, undefined, empresaId);
}
