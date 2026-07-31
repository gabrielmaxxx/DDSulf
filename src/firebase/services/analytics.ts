import { 
  addDocument, 
  queryDocuments, 
  subscribeCollection 
} from '../firestore';
import { HistoricalInsight } from '@/types';
import { DEFAULT_EMPRESA_ID } from '../../tenant';

const PATH = 'historical_insights';

/**
 * Register a newly calculated execution pattern or operational anomaly in tenant scope
 */
export async function addHistoricalInsight(empresaId: string = DEFAULT_EMPRESA_ID, insight: Omit<HistoricalInsight, 'id'>): Promise<string> {
  // TODO(fase-2): substituir por empresaId extraído do custom claim do token
  return await addDocument<HistoricalInsight>(PATH, insight, empresaId);
}

/**
 * Fetch all registered analytical trends in tenant scope
 */
export async function getHistoricalInsights(empresaId: string = DEFAULT_EMPRESA_ID): Promise<HistoricalInsight[]> {
  // TODO(fase-2): substituir por empresaId extraído do custom claim do token
  return await queryDocuments<HistoricalInsight>(PATH, {
    orderByField: 'confidence',
    orderDirection: 'desc'
  }, empresaId);
}

/**
 * Live updates of predictive performance metrics in tenant scope
 */
export function listenToHistoricalInsights(empresaId: string = DEFAULT_EMPRESA_ID, onUpdate: (insights: HistoricalInsight[]) => void): () => void {
  // TODO(fase-2): substituir por empresaId extraído do custom claim do token
  return subscribeCollection<HistoricalInsight>(PATH, {
    orderByField: 'confidence',
    orderDirection: 'desc'
  }, onUpdate, undefined, empresaId);
}
