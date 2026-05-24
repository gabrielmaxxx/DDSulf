import { 
  addDocument, 
  queryDocuments, 
  subscribeCollection 
} from '../firestore';
import { FinancialCost, Revenue } from '@/types';

const COSTS_PATH = 'financial_costs';
const REVENUES_PATH = 'revenues';

/**
 * Registers an operational expense or structural cost
 */
export async function addCost(cost: Omit<FinancialCost, 'id' | 'createdAt'>): Promise<string> {
  return await addDocument<FinancialCost>(COSTS_PATH, cost);
}

/**
 * Registers a service execution revenue or client invoice receipt
 */
export async function addRevenue(revenue: Omit<Revenue, 'id' | 'createdAt'>): Promise<string> {
  return await addDocument<Revenue>(REVENUES_PATH, revenue);
}

/**
 * Fetch all registered outlays
 */
export async function getAllCosts(): Promise<FinancialCost[]> {
  return await queryDocuments<FinancialCost>(COSTS_PATH, {
    orderByField: 'createdAt',
    orderDirection: 'desc'
  });
}

/**
 * Fetch all received and calculated revenues
 */
export async function getAllRevenues(): Promise<Revenue[]> {
  return await queryDocuments<Revenue>(REVENUES_PATH, {
    orderByField: 'receivedAt',
    orderDirection: 'desc'
  });
}

/**
 * Listen in realtime to active outlays
 */
export function listenToCosts(onUpdate: (costs: FinancialCost[]) => void): () => void {
  return subscribeCollection<FinancialCost>(COSTS_PATH, {
    orderByField: 'createdAt',
    orderDirection: 'desc'
  }, onUpdate);
}

/**
 * Listen in realtime to received revenues
 */
export function listenToRevenues(onUpdate: (revenues: Revenue[]) => void): () => void {
  return subscribeCollection<Revenue>(REVENUES_PATH, {
    orderByField: 'receivedAt',
    orderDirection: 'desc'
  }, onUpdate);
}
