import { 
  addDocument, 
  queryDocuments, 
  subscribeCollection 
} from '../firestore';
import { FinancialCost, Revenue } from '@/types';
import { DEFAULT_EMPRESA_ID } from '../../tenant';

const COSTS_PATH = 'financial_costs';
const REVENUES_PATH = 'revenues';

/**
 * Registers an operational expense or structural cost in tenant scope
 */
export async function addCost(empresaId: string = DEFAULT_EMPRESA_ID, cost: Omit<FinancialCost, 'id' | 'createdAt'>): Promise<string> {
  // TODO(fase-2): substituir por empresaId extraído do custom claim do token
  return await addDocument<FinancialCost>(COSTS_PATH, cost, empresaId);
}

/**
 * Registers a service execution revenue or client invoice receipt in tenant scope
 */
export async function addRevenue(empresaId: string = DEFAULT_EMPRESA_ID, revenue: Omit<Revenue, 'id' | 'createdAt'>): Promise<string> {
  // TODO(fase-2): substituir por empresaId extraído do custom claim do token
  return await addDocument<Revenue>(REVENUES_PATH, revenue, empresaId);
}

/**
 * Fetch all registered outlays in tenant scope
 */
export async function getAllCosts(empresaId: string = DEFAULT_EMPRESA_ID): Promise<FinancialCost[]> {
  // TODO(fase-2): substituir por empresaId extraído do custom claim do token
  return await queryDocuments<FinancialCost>(COSTS_PATH, {
    orderByField: 'createdAt',
    orderDirection: 'desc'
  }, empresaId);
}

/**
 * Fetch all received and calculated revenues in tenant scope
 */
export async function getAllRevenues(empresaId: string = DEFAULT_EMPRESA_ID): Promise<Revenue[]> {
  // TODO(fase-2): substituir por empresaId extraído do custom claim do token
  return await queryDocuments<Revenue>(REVENUES_PATH, {
    orderByField: 'receivedAt',
    orderDirection: 'desc'
  }, empresaId);
}

/**
 * Listen in realtime to active outlays in tenant scope
 */
export function listenToCosts(empresaId: string = DEFAULT_EMPRESA_ID, onUpdate: (costs: FinancialCost[]) => void): () => void {
  // TODO(fase-2): substituir por empresaId extraído do custom claim do token
  return subscribeCollection<FinancialCost>(COSTS_PATH, {
    orderByField: 'createdAt',
    orderDirection: 'desc'
  }, onUpdate, undefined, empresaId);
}

/**
 * Listen in realtime to received revenues in tenant scope
 */
export function listenToRevenues(empresaId: string = DEFAULT_EMPRESA_ID, onUpdate: (revenues: Revenue[]) => void): () => void {
  // TODO(fase-2): substituir por empresaId extraído do custom claim do token
  return subscribeCollection<Revenue>(REVENUES_PATH, {
    orderByField: 'receivedAt',
    orderDirection: 'desc'
  }, onUpdate, undefined, empresaId);
}
