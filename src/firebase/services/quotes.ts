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
 * Persists a new quote in Firestore with margin metrics calculated in tenant scope
 */
export async function createQuote(empresaId: string | undefined, id: string, quote?: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
  const targetId = quote ? id : (empresaId as string);
  const targetQuote = quote || (id as any);
  const targetEmpresa = quote ? empresaId : undefined;

  const margin = targetQuote.suggestedPrice > 0 
    ? ((targetQuote.suggestedPrice - targetQuote.estimatedCost) / targetQuote.suggestedPrice) * 100 
    : 0;

  const payload: Omit<Quote, 'id'> = {
    ...targetQuote,
    estimatedMargin: parseFloat(margin.toFixed(2)),
  } as any;

  await createDocument<Quote>(PATH, targetId, payload, targetEmpresa);
}

/**
 * Updates an operational quote's details and active execution status in tenant scope
 */
export async function updateQuote(empresaId: string | undefined, id: string, changes?: Partial<Quote>): Promise<void> {
  const targetId = changes ? id : (empresaId as string);
  const targetChanges = changes || (id as any);
  const targetEmpresa = changes ? empresaId : undefined;
  await updateExistingDocument<Quote>(PATH, targetId, targetChanges, targetEmpresa);
}

/**
 * Fetches a single quote by its primary ID in tenant scope
 */
export async function getQuote(empresaId: string | undefined, id?: string): Promise<Quote | null> {
  const targetId = id || (empresaId as string);
  const targetEmpresa = id ? empresaId : undefined;
  return await getDocument<Quote>(PATH, targetId, targetEmpresa);
}

/**
 * Queries all quotes belonging to the platform tenant
 */
export async function getAllQuotes(empresaId?: string): Promise<Quote[]> {
  return await queryDocuments<Quote>(PATH, {
    orderByField: 'updatedAt',
    orderDirection: 'desc'
  }, empresaId);
}

/**
 * Queries quotes filtered by their operational status (e.g. Aprovado, Rascunho) in tenant scope
 */
export async function getQuotesByStatus(empresaId: string | undefined, status?: QuoteStatus): Promise<Quote[]> {
  const targetStatus = status || (empresaId as QuoteStatus);
  const targetEmpresa = status ? empresaId : undefined;
  return await queryDocuments<Quote>(PATH, {
    filters: [
      { field: 'status', operator: '==', value: targetStatus }
    ],
    orderByField: 'updatedAt',
    orderDirection: 'desc'
  }, targetEmpresa);
}

/**
 * Live realtime listener for quotes list in tenant scope
 */
export function listenToQuotes(empresaId: string | undefined, onUpdate: (quotes: Quote[]) => void): () => void;
export function listenToQuotes(onUpdate: (quotes: Quote[]) => void): () => void;
export function listenToQuotes(arg1: any, arg2?: any): () => void {
  const empresaId = typeof arg1 === 'string' ? arg1 : undefined;
  const onUpdate = typeof arg1 === 'function' ? arg1 : arg2;
  return subscribeCollection<Quote>(PATH, {
    orderByField: 'updatedAt',
    orderDirection: 'desc'
  }, onUpdate, undefined, empresaId);
}
