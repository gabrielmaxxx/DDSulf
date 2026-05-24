import { 
  getDocument, 
  createDocument, 
  updateExistingDocument, 
  queryDocuments,
  subscribeCollection 
} from '../firestore';
import { Quote, QuoteStatus } from '@/types';

const PATH = 'quotes';

/**
 * Persists a new quote in Firestore with margin metrics calculated
 */
export async function createQuote(id: string, quote: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
  const margin = quote.suggestedPrice > 0 
    ? ((quote.suggestedPrice - quote.estimatedCost) / quote.suggestedPrice) * 100 
    : 0;

  const payload: Omit<Quote, 'id'> = {
    ...quote,
    estimatedMargin: parseFloat(margin.toFixed(2)),
  } as any;

  await createDocument<Quote>(PATH, id, payload);
}

/**
 * Updates an operational quote's details and active execution status
 */
export async function updateQuote(id: string, changes: Partial<Quote>): Promise<void> {
  await updateExistingDocument<Quote>(PATH, id, changes);
}

/**
 * Fetches a single quote by its primary ID
 */
export async function getQuote(id: string): Promise<Quote | null> {
  return await getDocument<Quote>(PATH, id);
}

/**
 * Queries all quotes belonging to the platform
 */
export async function getAllQuotes(): Promise<Quote[]> {
  return await queryDocuments<Quote>(PATH, {
    orderByField: 'updatedAt',
    orderDirection: 'desc'
  });
}

/**
 * Queries quotes filtered by their operational status (e.g. Aprovado, Rascunho)
 */
export async function getQuotesByStatus(status: QuoteStatus): Promise<Quote[]> {
  return await queryDocuments<Quote>(PATH, {
    filters: [
      { field: 'status', operator: '==', value: status }
    ],
    orderByField: 'updatedAt',
    orderDirection: 'desc'
  });
}

/**
 * Live realtime listener for quotes list
 */
export function listenToQuotes(onUpdate: (quotes: Quote[]) => void): () => void {
  return subscribeCollection<Quote>(PATH, {
    orderByField: 'updatedAt',
    orderDirection: 'desc'
  }, onUpdate);
}
