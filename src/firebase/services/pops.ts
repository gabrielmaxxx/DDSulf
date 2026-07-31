import { 
  getDocument, 
  createDocument, 
  queryDocuments,
  subscribeCollection
} from '../firestore';
import { POP } from '@/types';

const PATH = 'pops';

/**
 * Persist or edit a technical operational standard procedure in tenant scope
 */
export async function savePOP(empresaId: string | undefined, id: string, pop?: Omit<POP, 'id' | 'updatedAt'>): Promise<void> {
  const targetId = pop ? id : (empresaId as string);
  const targetPayload = pop || (id as any);
  const targetEmpresa = pop ? empresaId : undefined;
  await createDocument<POP>(PATH, targetId, targetPayload, targetEmpresa);
}

/**
 * Fetch a single operational procedure specifications sheet in tenant scope
 */
export async function getPOP(empresaId: string | undefined, id?: string): Promise<POP | null> {
  const targetId = id || (empresaId as string);
  const targetEmpresa = id ? empresaId : undefined;
  return await getDocument<POP>(PATH, targetId, targetEmpresa);
}

/**
 * Queries all standard procedures belonging to the wiki database in tenant scope
 */
export async function getAllPOPs(empresaId?: string): Promise<POP[]> {
  return await queryDocuments<POP>(PATH, {
    orderByField: 'title',
    orderDirection: 'asc'
  }, empresaId);
}

/**
 * Filter POP sheets by pest classification categories in tenant scope
 */
export async function getPOPsByPest(empresaId: string | undefined, pestType?: string): Promise<POP[]> {
  const targetPest = pestType || (empresaId as string);
  const targetEmpresa = pestType ? empresaId : undefined;
  return await queryDocuments<POP>(PATH, {
    filters: [
      { field: 'pestType', operator: '==', value: targetPest }
    ],
    orderByField: 'title',
    orderDirection: 'asc'
  }, targetEmpresa);
}

/**
 * Live realtime listener for standard field technical protocols in tenant scope
 */
export function listenToPOPs(empresaId: string | undefined, onUpdate: (pops: POP[]) => void): () => void;
export function listenToPOPs(onUpdate: (pops: POP[]) => void): () => void;
export function listenToPOPs(arg1: any, arg2?: any): () => void {
  const empresaId = typeof arg1 === 'string' ? arg1 : undefined;
  const onUpdate = typeof arg1 === 'function' ? arg1 : arg2;
  return subscribeCollection<POP>(PATH, {
    orderByField: 'title',
    orderDirection: 'asc'
  }, onUpdate, undefined, empresaId);
}
