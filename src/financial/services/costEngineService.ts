import { db, auth } from '@/services/firebase';
import { collection, addDoc, doc, setDoc, getDocs, serverTimestamp, writeBatch } from 'firebase/firestore';
import { FixedCostItem, VariableCostItem, CostAllocationSettings, OperationalFinancialSnapshot } from '../types';
import { tenantStorage } from '@/utils/storage';

export enum FinancialOperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: FinancialOperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  };
}

/**
 * Handles transaction failures conforming structurally to Firebase hardening guides
 */
export function handleFirestoreError(error: unknown, operationType: FinancialOperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || 'offline_anon',
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null
    },
    operationType,
    path
  };
  console.error('Firestore Financial Engine Request Failed:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const costEngineService = {
  /**
   * Loads general fixed costs parameters
   */
  async loadFixedCosts(): Promise<FixedCostItem[]> {
    const path = 'financial_fixed_costs';
    try {
      const snap = await getDocs(collection(db, path));
      if (snap.empty) {
        return [];
      }
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
    } catch (err) {
      if (err instanceof Error && (err.message.includes('offline') || err.message.includes('permission'))) {
        // Recover from local offline cache
        return JSON.parse(tenantStorage.getItem('fixed_costs') || '[]');
      }
      handleFirestoreError(err, FinancialOperationType.LIST, path);
    }
  },

  /**
   * Persists fixed overhead costs list
   */
  async saveFixedCosts(items: FixedCostItem[]): Promise<void> {
    const path = 'financial_fixed_costs';
    try {
      // Offline fallback
      tenantStorage.setItem('fixed_costs', JSON.stringify(items));

      // Batch transactional upload to cloud firestore
      const batch = writeBatch(db);
      items.forEach(item => {
        const docRef = doc(collection(db, path), item.id);
        batch.set(docRef, {
          ...item,
          updatedAt: new Date().toISOString()
        });
      });
      await batch.commit();
    } catch (err) {
      if (err instanceof Error && (err.message.includes('offline') || err.message.includes('permission'))) {
        console.warn('Working offline: Fixed costs stored locally.');
        return;
      }
      handleFirestoreError(err, FinancialOperationType.WRITE, path);
    }
  },

  /**
   * Loads variable costing variables database
   */
  async loadVariableCosts(): Promise<VariableCostItem[]> {
    const path = 'financial_variable_costs';
    try {
      const snap = await getDocs(collection(db, path));
      if (snap.empty) {
        return [];
      }
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
    } catch (err) {
      if (err instanceof Error && (err.message.includes('offline') || err.message.includes('permission'))) {
        return JSON.parse(tenantStorage.getItem('variable_costs') || '[]');
      }
      handleFirestoreError(err, FinancialOperationType.LIST, path);
    }
  },

  /**
   * Persists variable factors parameters list
   */
  async saveVariableCosts(items: VariableCostItem[]): Promise<void> {
    const path = 'financial_variable_costs';
    try {
      tenantStorage.setItem('variable_costs', JSON.stringify(items));

      const batch = writeBatch(db);
      items.forEach(item => {
        const docRef = doc(collection(db, path), item.id);
        batch.set(docRef, {
          ...item,
          updatedAt: new Date().toISOString()
        });
      });
      await batch.commit();
    } catch (err) {
      if (err instanceof Error && (err.message.includes('offline') || err.message.includes('permission'))) {
        console.warn('Working offline: Variable costs saved locally.');
        return;
      }
      handleFirestoreError(err, FinancialOperationType.WRITE, path);
    }
  },

  /**
   * Fetches the current administrative overhead rateio allocation adjustments
   */
  async loadAllocationSettings(): Promise<CostAllocationSettings | null> {
    const path = 'financial_allocation_config';
    try {
      const snap = await getDocs(collection(db, path));
      if (snap.empty) return null;
      return { id: snap.docs[0].id, ...snap.docs[0].data() } as any;
    } catch (err) {
      if (err instanceof Error && (err.message.includes('offline') || err.message.includes('permission'))) {
        const cached = tenantStorage.getItem('allocation_settings');
        return cached ? JSON.parse(cached) : null;
      }
      handleFirestoreError(err, FinancialOperationType.LIST, path);
    }
  },

  /**
   * Saves overhead allocation formulas targets
   */
  async saveAllocationSettings(settings: CostAllocationSettings): Promise<void> {
    const path = 'financial_allocation_config';
    try {
      tenantStorage.setItem('allocation_settings', JSON.stringify(settings));
      await setDoc(doc(db, path, settings.id), {
        ...settings,
        updatedAt: new Date().toISOString(),
        serverTimestamp: serverTimestamp()
      });
    } catch (err) {
      if (err instanceof Error && (err.message.includes('offline') || err.message.includes('permission'))) {
        console.warn('Working offline: Allocation settings stored locally.');
        return;
      }
      handleFirestoreError(err, FinancialOperationType.WRITE, path + '/' + settings.id);
    }
  },

  /**
   * Commits snapshots of single operational transactions
   */
  async saveTransactionalSnapshot(snapshot: OperationalFinancialSnapshot): Promise<void> {
    const path = 'financial_snapshots';
    try {
      const offlineSnapshots = JSON.parse(tenantStorage.getItem('financial_snapshots') || '[]');
      offlineSnapshots.unshift(snapshot);
      tenantStorage.setItem('financial_snapshots', JSON.stringify(offlineSnapshots));

      await addDoc(collection(db, path), {
        ...snapshot,
        serverTimestamp: serverTimestamp()
      });
    } catch (err) {
      if (err instanceof Error && (err.message.includes('offline') || err.message.includes('permission'))) {
        console.warn('Working offline: snapshot saved to local track.');
        return;
      }
      handleFirestoreError(err, FinancialOperationType.CREATE, path);
    }
  },

  /**
   * Recovers snapshot trails to feed charts
   */
  async loadTransactionalSnapshots(): Promise<OperationalFinancialSnapshot[]> {
    const path = 'financial_snapshots';
    try {
      const snap = await getDocs(collection(db, path));
      if (snap.empty) {
        return JSON.parse(tenantStorage.getItem('financial_snapshots') || '[]');
      }
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
    } catch (err) {
      return JSON.parse(tenantStorage.getItem('financial_snapshots') || '[]');
    }
  }
};
