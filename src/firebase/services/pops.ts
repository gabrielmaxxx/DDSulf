import { 
  getDocument, 
  createDocument, 
  updateExistingDocument, 
  queryDocuments,
  subscribeCollection
} from '../firestore';
import { POP } from '@/types';

const PATH = 'pops';

/**
 * Persist or edit a technical operational standard procedure
 */
export async function savePOP(id: string, pop: Omit<POP, 'id' | 'updatedAt'>): Promise<void> {
  await createDocument<POP>(PATH, id, pop);
}

/**
 * Fetch a single operational procedure specifications sheet
 */
export async function getPOP(id: string): Promise<POP | null> {
  return await getDocument<POP>(PATH, id);
}

/**
 * Queries all standard procedures belonging to the wiki database
 */
export async function getAllPOPs(): Promise<POP[]> {
  return await queryDocuments<POP>(PATH, {
    orderByField: 'title',
    orderDirection: 'asc'
  });
}

/**
 * Filter POP sheets by pest classification categories (e.g. Baratas, Cupins)
 */
export async function getPOPsByPest(pestType: string): Promise<POP[]> {
  return await queryDocuments<POP>(PATH, {
    filters: [
      { field: 'pestType', operator: '==', value: pestType }
    ],
    orderByField: 'title',
    orderDirection: 'asc'
  });
}

/**
 * Live realtime listener for standard field technical protocols
 */
export function listenToPOPs(onUpdate: (pops: POP[]) => void): () => void {
  return subscribeCollection<POP>(PATH, {
    orderByField: 'title',
    orderDirection: 'asc'
  }, onUpdate);
}
