import { 
  getDocument, 
  createDocument, 
  updateExistingDocument, 
  queryDocuments,
  subscribeCollection 
} from '../firestore';
import { Quote, QuoteStatus } from '@/types';
import { DEFAULT_EMPRESA_ID } from '../../tenant';

const PATH = 'quotes';

/**
 * Persists a new quote in Firestore with margin metrics calculated in tenant scope
 */
export async function createQuote(empresaId: string = DEFAULT_EMPRESA_ID, id: string, quote: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
  // TODO(fase-2): substituir por empresaId extraído do custom claim do token
  const margin = quote.suggestedPrice > 0 
    ? ((quote.suggestedPrice - quote.estimatedCost) / quote.suggestedPrice) * 100 
    : 0;

  const payload: Omit<Quote, 'id'> = {
    ...quote,
    estimatedMargin: parseFloat(margin.toFixed(2)),
  } as any;

  await createDocument<Quote>(PATH, id, payload, empresaId);
}

/**
 * Updates an operational quote's details and active execution status in tenant scope
 */
export async function updateQuote(empresaId: string = DEFAULT_EMPRESA_ID, id: string, changes: Partial<Quote>): Promise<void> {
  // TODO(fase-2): substituir por empresaId extraído do custom claim do token
  await updateExistingDocument<Quote>(PATH, id, changes, empresaId);
}

/**
 * Fetches a single quote by its primary ID in tenant scope
 */
export async function getQuote(empresaId: string = DEFAULT_EMPRESA_ID, id: string): Promise<Quote | null> {
  // TODO(fase-2): substituir por empresaId extraído do custom claim do token
  return await getDocument<Quote>(PATH, id, empresaId);
}

/**
 * Queries all quotes belonging to the platform tenant
 */
export async function getAllQuotes(empresaId: string = DEFAULT_EMPRESA_ID): Promise<Quote[]> {
  // TODO(fase-2): substituir por empresaId extraído do custom claim do token
  return await queryDocuments<Quote>(PATH, {
    orderByField: 'updatedAt',
    orderDirection: 'desc'
  }, empresaId);
}

/**
 * Queries quotes filtered by their operational status (e.g. Aprovado, Rascunho) in tenant scope
 */
export async function getQuotesByStatus(empresaId: string = DEFAULT_EMPRESA_ID, status: QuoteStatus): Promise<Quote[]> {
  // TODO(fase-2): substituir por empresaId extraído do custom claim do token
  return await queryDocuments<Quote>(PATH, {
    filters: [
      { field: 'status', operator: '==', value: status }
    ],
    orderByField: 'updatedAt',
    orderDirection: 'desc'
  }, empresaId);
}

/**
 * Live realtime listener for quotes list in tenant scope
 */
export function listenToQuotes(empresaId: string = DEFAULT_EMPRESA_ID, onUpdate: (quotes: Quote[]) => void): () => void {
  // TODO(fase-2): substituir por empresaId extraído do custom claim do token
  return subscribeCollection<Quote>(PATH, {
    orderByField: 'updatedAt',
    orderDirection: 'desc'
  }, onUpdate, undefined, empresaId);
}
