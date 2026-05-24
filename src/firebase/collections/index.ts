/**
 * DDSulf Central Collection Definitions and Schema Assertions
 * Strictly mapped to `firebase-blueprint.json` coordinates.
 */

import { QueryConstraint, where } from 'firebase/firestore';

export const COLLECTIONS = {
  USERS: 'users',
  CLIENTS: 'clients',
  QUOTES: 'quotes',
  SERVICES: 'services',
  FINANCIAL_COSTS: 'financial_costs',
  REVENUES: 'revenues',
  PRODUCTS: 'products',
  STOCK_MOVEMENTS: 'stock_movements',
  POPS: 'pops',
  DASHBOARD_METRICS: 'dashboard_metrics',
  HISTORICAL_INSIGHTS: 'historical_insights',
} as const;

export type CollectionName = typeof COLLECTIONS[keyof typeof COLLECTIONS];

/**
 * Access isolation filter: restricts queries to the correct organization/creator or role boundaries.
 */
export function buildScopeConstraint(userId: string, role: string): QueryConstraint[] {
  // Admin & Manager can inspect any metrics or clients; technicians and commercial might have localized queries
  if (role === 'admin' || role === 'manager') {
    return [];
  }
  
  if (role === 'commercial') {
    // Only commercial users can query their customized quotes
    return [where('createdBy', '==', userId)];
  }

  if (role === 'technician') {
    // Technicians only query services they are allocated to
    return [where('technicians', 'array-contains', userId)];
  }

  return [where('createdBy', '==', userId)];
}
