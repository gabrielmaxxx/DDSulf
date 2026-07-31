import { 
  getDocument, 
  createDocument, 
  queryDocuments,
  subscribeCollection
} from '../firestore';
import { POP } from '@/types';
import { DEFAULT_EMPRESA_ID } from '../../tenant';

const PATH = 'pops';

/**
 * Persist or edit a technical operational standard procedure in tenant scope
 */
export async function savePOP(empresaId: string = DEFAULT_EMPRESA_ID, id: string, pop: Omit<POP, 'id' | 'updatedAt'>): Promise<void> {
  // TODO(fase-2): substituir por empresaId extraído do custom claim do token
  await createDocument<POP>(PATH, id, pop, empresaId);
}

/**
 * Fetch a single operational procedure specifications sheet in tenant scope
 */
export async function getPOP(empresaId: string = DEFAULT_EMPRESA_ID, id: string): Promise<POP | null> {
  // TODO(fase-2): substituir por empresaId extraído do custom claim do token
  return await getDocument<POP>(PATH, id, empresaId);
}

/**
 * Queries all standard procedures belonging to the wiki database in tenant scope
 */
export async function getAllPOPs(empresaId: string = DEFAULT_EMPRESA_ID): Promise<POP[]> {
  // TODO(fase-2): substituir por empresaId extraído do custom claim do token
  return await queryDocuments<POP>(PATH, {
    orderByField: 'title',
    orderDirection: 'asc'
  }, empresaId);
}

/**
 * Filter POP sheets by pest classification categories in tenant scope
 */
export async function getPOPsByPest(empresaId: string = DEFAULT_EMPRESA_ID, pestType: string): Promise<POP[]> {
  // TODO(fase-2): substituir por empresaId extraído do custom claim do token
  return await queryDocuments<POP>(PATH, {
    filters: [
      { field: 'pestType', operator: '==', value: pestType }
    ],
    orderByField: 'title',
    orderDirection: 'asc'
  }, empresaId);
}

/**
 * Live realtime listener for standard field technical protocols in tenant scope
 */
export function listenToPOPs(empresaId: string = DEFAULT_EMPRESA_ID, onUpdate: (pops: POP[]) => void): () => void {
  // TODO(fase-2): substituir por empresaId extraído do custom claim do token
  return subscribeCollection<POP>(PATH, {
    orderByField: 'title',
    orderDirection: 'asc'
  }, onUpdate, undefined, empresaId);
}
