/**
 * DDSulf — Unified TypeScript Types & Interface Foundation
 * Combines core database schemas with application UI layer systems.
 */

// Re-export every core entity type from the database schemas to prevent duplicate declarations
export * from './database';
export * from './qa';

// Re-export and declare additional application-level UI types if necessary
import { 
  UserProfile, 
  QuoteStatus, 
  FinancialCost, 
  Revenue, 
  Product, 
  POP,
  HistoricalInsight
} from './database';

// Backwards-compatible aliases or supplemental types for existing services:
export interface User {
  uid: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'commercial' | 'technician' | 'operator';
  createdAt: string;
}

// Ensure the UI and hooks have clean schemas that link database representations with local application state
export interface CustomFinancialSettings {
  id: 'default';
  costPerHour: number;
  costPerKm: number;
  minimumMargin: number;
  baseOperationalCost: number;
  updatedAt: string;
}
