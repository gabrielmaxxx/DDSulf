import { 
  addDocument, 
  queryDocuments, 
  subscribeCollection 
} from '../firestore';
import { HistoricalInsight } from '@/types';

const PATH = 'historical_insights';

/**
 * Register a newly calculated execution pattern or operational anomaly
 */
export async function addHistoricalInsight(insight: Omit<HistoricalInsight, 'id'>): Promise<string> {
  return await addDocument<HistoricalInsight>(PATH, insight);
}

/**
 * Fetch all registered analytical trends
 */
export async function getHistoricalInsights(): Promise<HistoricalInsight[]> {
  return await queryDocuments<HistoricalInsight>(PATH, {
    orderByField: 'confidence',
    orderDirection: 'desc'
  });
}

/**
 * Live updates of predictive performance metrics
 */
export function listenToHistoricalInsights(onUpdate: (insights: HistoricalInsight[]) => void): () => void {
  return subscribeCollection<HistoricalInsight>(PATH, {
    orderByField: 'confidence',
    orderDirection: 'desc'
  }, onUpdate);
}
