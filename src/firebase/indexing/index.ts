/**
 * DDSulf Firestore Composite Queries & Index Composition Specification
 * Strictly documents required cloud assets for administrative query compliance.
 */

export interface FirestoreCompositeIndex {
  collectionGroup: string;
  queryScope: 'COLLECTION' | 'COLLECTION_GROUP';
  fields: {
    fieldPath: string;
    order: 'ASCENDING' | 'DESCENDING' | 'ARRAY_CONTAINS';
  }[];
}

/**
 * Enterprise Composite Index Declarations
 * Mapped directly to repositories and custom filters inside queries/index.ts.
 */
export const REQUIRED_FIRESTORE_INDEXES: FirestoreCompositeIndex[] = [
  {
    collectionGroup: 'quotes',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'createdBy', order: 'ASCENDING' },
      { fieldPath: 'updatedAt', order: 'DESCENDING' }
    ]
  },
  {
    collectionGroup: 'quotes',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'status', order: 'ASCENDING' },
      { fieldPath: 'updatedAt', order: 'DESCENDING' }
    ]
  },
  {
    collectionGroup: 'services',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'technicians', order: 'ARRAY_CONTAINS' },
      { fieldPath: 'executionDate', order: 'DESCENDING' }
    ]
  },
  {
    collectionGroup: 'stock_movements',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'productId', order: 'ASCENDING' },
      { fieldPath: 'createdAt', order: 'DESCENDING' }
    ]
  },
  {
    collectionGroup: 'financial_costs',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'category', order: 'ASCENDING' },
      { fieldPath: 'createdAt', order: 'DESCENDING' }
    ]
  }
];

export function getMissingIndexConsoleLogs(): string[] {
  return REQUIRED_FIRESTORE_INDEXES.map((idx) => {
    const fieldsStr = idx.fields
      .map(f => `${f.fieldPath} (${f.order === 'ARRAY_CONTAINS' ? 'array' : f.order.toLowerCase()})`)
      .join(', ');
    return `Create composite index on collection "${idx.collectionGroup}" with fields: ${fieldsStr}`;
  });
}
