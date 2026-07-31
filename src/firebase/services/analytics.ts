import { 
  addDocument, 
  queryDocuments, 
  subscribeCollection 
} from '../firestore';
import { HistoricalInsight } from '@/types';

const PATH = 'historical_insights';

/**
 * Register a newly calculated execution pattern or operational anomaly in tenant scope
 */
export async function addHistoricalInsight(empresaId?: string, insight?: Omit<HistoricalInsight, 'id'>): Promise<string> {
  const payload = insight || (empresaId as any);
  const targetEmpresa = typeof empresaId === 'string' ? empresaId : undefined;
  return await addDocument<HistoricalInsight>(PATH, payload, targetEmpresa);
}

/**
 * Fetch all registered analytical trends in tenant scope
 */
export async function getHistoricalInsights(empresaId?: string): Promise<HistoricalInsight[]> {
  return await queryDocuments<HistoricalInsight>(PATH, {
    orderByField: 'confidence',
    orderDirection: 'desc'
  }, empresaId);
}

/**
 * Live updates of predictive performance metrics in tenant scope
 */
export function listenToHistoricalInsights(empresaId: string | undefined, onUpdate: (insights: HistoricalInsight[]) => void): () => void;
export function listenToHistoricalInsights(onUpdate: (insights: HistoricalInsight[]) => void): () => void;
export function listenToHistoricalInsights(arg1: any, arg2?: any): () => void {
  const empresaId = typeof arg1 === 'string' ? arg1 : undefined;
  const onUpdate = typeof arg1 === 'function' ? arg1 : arg2;
  return subscribeCollection<HistoricalInsight>(PATH, {
    orderByField: 'confidence',
    orderDirection: 'desc'
  }, onUpdate, undefined, empresaId);
}
