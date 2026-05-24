import { 
  CollectionReference, 
  Query, 
  WhereFilterOp, 
  OrderByDirection, 
  query as firestoreQuery, 
  where, 
  orderBy, 
  limit, 
  startAfter 
} from 'firebase/firestore';

export interface QueryFilter {
  field: string;
  operator: WhereFilterOp;
  value: any;
}

export interface QueryOrder {
  field: string;
  direction?: OrderByDirection;
}

export interface QueryParams {
  filters?: QueryFilter[];
  orders?: QueryOrder[];
  itemLimit?: number;
  startAfterDoc?: any;
}

export class QueryBuilder {
  /**
   * Builds and returns a Firestore Query object based on the supplied QueryParams
   */
  static build(ref: CollectionReference | Query, params: QueryParams): Query {
    let q = ref;
    const constraints: any[] = [];

    // 1. Add Filter Constraints
    if (params.filters && params.filters.length > 0) {
      params.filters.forEach(f => {
        if (f.value !== undefined && f.value !== null && f.value !== '') {
          constraints.push(where(f.field, f.operator, f.value));
        }
      });
    }

    // 2. Add Ordering Constraints
    if (params.orders && params.orders.length > 0) {
      params.orders.forEach(o => {
        constraints.push(orderBy(o.field, o.direction || 'asc'));
      });
    }

    // 3. Add Pagination limit
    if (params.itemLimit && params.itemLimit > 0) {
      constraints.push(limit(params.itemLimit));
    }

    // 4. Cursor cursor offset
    if (params.startAfterDoc) {
      constraints.push(startAfter(params.startAfterDoc));
    }

    return firestoreQuery(q, ...constraints);
  }
}

export default QueryBuilder;
