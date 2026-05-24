/**
 * Enterprise Query Architectural Optimization Layer
 * Implements cursor pagination, partial query caching, and selective filtering
 */

import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter, 
  getDocs, 
  QueryConstraint,
  OrderByDirection,
  getDocsFromCache,
  getDocsFromServer
} from 'firebase/firestore';
import { db } from '../config';
import { QueryFilter } from '../types';

export interface PaginatedResult<T> {
  data: T[];
  lastVisibleDoc: any | null; // For next cursor pagination
  hasMore: boolean;
}

export interface AdvancedQueryOptions {
  filters?: QueryFilter[];
  sortField?: string;
  sortDirection?: OrderByDirection;
  pageSize?: number;
  startCursor?: any;
  cachePolicy?: 'cache-first' | 'server-only' | 'default';
}

/**
 * Executes a highly scalable paginated query against any collection
 */
export async function executeAdvancedQuery<T>(
  collectionName: string,
  options: AdvancedQueryOptions = {}
): Promise<PaginatedResult<T>> {
  const {
    filters = [],
    sortField = 'createdAt',
    sortDirection = 'desc',
    pageSize = 20,
    startCursor = null,
    cachePolicy = 'default'
  } = options;

  const colRef = collection(db, collectionName);
  const constraints: QueryConstraint[] = [];

  // 1. Build Filters
  for (const filter of filters) {
    constraints.push(where(filter.field, filter.operator, filter.value));
  }

  // 2. Build Sort ordering
  if (sortField) {
    constraints.push(orderBy(sortField, sortDirection));
  }

  // 3. Setup start after cursor for pagination
  if (startCursor) {
    constraints.push(startAfter(startCursor));
  }

  // 4. Overfetch by 1 document to determine if "hasMore" is true
  constraints.push(limit(pageSize + 1));

  const q = query(colRef, ...constraints);
  let snapshot;

  // 5. Apply cache optimization policy
  try {
    if (cachePolicy === 'cache-first') {
      try {
        snapshot = await getDocsFromCache(q);
      } catch {
        snapshot = await getDocsFromServer(q);
      }
    } else if (cachePolicy === 'server-only') {
      snapshot = await getDocsFromServer(q);
    } else {
      snapshot = await getDocs(q);
    }
  } catch (error) {
    console.warn(`[Firestore Query] Direct fetch issue, falling back to standard`, error);
    snapshot = await getDocs(q);
  }

  const rawDocs = snapshot.docs;
  const hasMore = rawDocs.length > pageSize;
  const paginatedDocs = hasMore ? rawDocs.slice(0, pageSize) : rawDocs;

  const data = paginatedDocs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as T[];

  const lastVisibleDoc = paginatedDocs.length > 0 ? paginatedDocs[paginatedDocs.length - 1] : null;

  return {
    data,
    lastVisibleDoc,
    hasMore,
  };
}

/**
 * Simple cursor pagination helper specifically for high volume quote ledgers
 */
export async function fetchQuotesLedger(
  clientUid: string,
  pageSize = 10,
  cursor?: any
): Promise<PaginatedResult<any>> {
  return executeAdvancedQuery('quotes', {
    filters: [
      { field: 'createdBy', operator: '==', value: clientUid }
    ],
    sortField: 'updatedAt',
    sortDirection: 'desc',
    pageSize,
    startCursor: cursor
  });
}
