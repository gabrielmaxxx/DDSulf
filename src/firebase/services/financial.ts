import { 
  addDocument, 
  queryDocuments, 
  subscribeCollection 
} from '../firestore';
import { FinancialCost, Revenue } from '@/types';

const COSTS_PATH = 'financial_costs';
const REVENUES_PATH = 'revenues';

/**
 * Registers an operational expense or structural cost in tenant scope
 */
export async function addCost(empresaId?: string, cost?: Omit<FinancialCost, 'id' | 'createdAt'>): Promise<string> {
  const payload = cost || (empresaId as any);
  const targetEmpresa = typeof empresaId === 'string' ? empresaId : undefined;
  return await addDocument<FinancialCost>(COSTS_PATH, payload, targetEmpresa);
}

/**
 * Registers a service execution revenue or client invoice receipt in tenant scope
 */
export async function addRevenue(empresaId?: string, revenue?: Omit<Revenue, 'id' | 'createdAt'>): Promise<string> {
  const payload = revenue || (empresaId as any);
  const targetEmpresa = typeof empresaId === 'string' ? empresaId : undefined;
  return await addDocument<Revenue>(REVENUES_PATH, payload, targetEmpresa);
}

/**
 * Fetch all registered outlays in tenant scope
 */
export async function getAllCosts(empresaId?: string): Promise<FinancialCost[]> {
  return await queryDocuments<FinancialCost>(COSTS_PATH, {
    orderByField: 'createdAt',
    orderDirection: 'desc'
  }, empresaId);
}

/**
 * Fetch all received and calculated revenues in tenant scope
 */
export async function getAllRevenues(empresaId?: string): Promise<Revenue[]> {
  return await queryDocuments<Revenue>(REVENUES_PATH, {
    orderByField: 'receivedAt',
    orderDirection: 'desc'
  }, empresaId);
}

/**
 * Listen in realtime to active outlays in tenant scope
 */
export function listenToCosts(empresaId: string | undefined, onUpdate: (costs: FinancialCost[]) => void): () => void;
export function listenToCosts(onUpdate: (costs: FinancialCost[]) => void): () => void;
export function listenToCosts(arg1: any, arg2?: any): () => void {
  const empresaId = typeof arg1 === 'string' ? arg1 : undefined;
  const onUpdate = typeof arg1 === 'function' ? arg1 : arg2;
  return subscribeCollection<FinancialCost>(COSTS_PATH, {
    orderByField: 'createdAt',
    orderDirection: 'desc'
  }, onUpdate, undefined, empresaId);
}

/**
 * Listen in realtime to received revenues in tenant scope
 */
export function listenToRevenues(empresaId: string | undefined, onUpdate: (revenues: Revenue[]) => void): () => void;
export function listenToRevenues(onUpdate: (revenues: Revenue[]) => void): () => void;
export function listenToRevenues(arg1: any, arg2?: any): () => void {
  const empresaId = typeof arg1 === 'string' ? arg1 : undefined;
  const onUpdate = typeof arg1 === 'function' ? arg1 : arg2;
  return subscribeCollection<Revenue>(REVENUES_PATH, {
    orderByField: 'receivedAt',
    orderDirection: 'desc'
  }, onUpdate, undefined, empresaId);
}
