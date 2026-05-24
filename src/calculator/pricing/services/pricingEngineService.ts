import { db, auth } from '@/services/firebase';
import { collection, addDoc, doc, setDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { FullPricingCalculationOutput } from '../engine/pricingEngine';

export enum PricingOperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: PricingOperationType;
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
 * Robustly maps and formats security or authorization transaction failures
 */
export function handleFirestoreError(error: unknown, operationType: PricingOperationType, path: string | null): never {
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
  console.error('Firestore Pricing Transaction Failed:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const pricingEngineService = {
  /**
   * Persists the official calculation proposal report to Firestore database
 * If offline, gracefully caches the draft locally
 */
  async saveOfficialProposal(
    clientName: string,
    calculation: FullPricingCalculationOutput
  ): Promise<{ id: string; source: 'firestore' | 'offline' }> {
    const payload = {
      clientName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      inputs: {
        ...calculation.inputs,
        chemicalProducts: calculation.costing.chemicalInsumos.items
      },
      costs: {
        totalOperationalCost: calculation.costing.totalOperationCost,
        subtotalDirectCost: calculation.costing.subtotalDirectCost,
        chemicalsTotal: calculation.costing.chemicalInsumos.totalChemicalCost,
        logisticsTotal: calculation.costing.logistics.totalLogisticsCost,
        laborTotal: calculation.costing.labor.totalLaborCost,
        overheadTotal: calculation.costing.overheadAndAssets.totalAssetAndOverheadCost,
        taxesTotal: calculation.costing.taxAmount
      },
      pricing: {
        suggestedPrice: calculation.pricing.suggestedPrice,
        breakEvenPrice: calculation.pricing.breakEvenPrice,
        minPermittedPrice: calculation.pricing.minPermittedPrice,
        actualMarginPercent: calculation.pricing.actualMarginPercent,
        actualNetProfitAmount: calculation.pricing.actualNetProfitAmount,
        customMarginUsed: calculation.pricing.profitMarginSelected
      },
      analytics: {
        ...calculation.analytics
      },
      createdBy: auth?.currentUser?.uid || 'anonymous_calculator',
      status: 'Proposta'
    };

    const path = 'quotes';

    try {
      // Test firestore status if online
      const docRef = await addDoc(collection(db, path), {
        ...payload,
        serverTimestamp: serverTimestamp()
      });
      return { id: docRef.id, source: 'firestore' };
    } catch (err: any) {
      if (
        err?.message?.includes('offline') || 
        err?.code === 'unavailable' || 
        err?.message?.includes('Failed to get document') ||
        err?.message?.includes('permission')
      ) {
        // Fallback local persistence storage mechanism for offline capabilities
        console.warn("Pricing service operating offline or unauthenticated: saving to offline stack.");
        try {
          const offlineStack = JSON.parse(localStorage.getItem('ddsulf_offline_quotes') || '[]');
          const generatedId = `offline_quote_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
          
          offlineStack.unshift({
            ...payload,
            id: generatedId,
            isOfflineDraft: true
          });
          
          localStorage.setItem('ddsulf_offline_quotes', JSON.stringify(offlineStack));
          return { id: generatedId, source: 'offline' };
        } catch (localWriteErr) {
          console.error("Critical local fallback storage failed: ", localWriteErr);
        }
      }
      handleFirestoreError(err, PricingOperationType.CREATE, path);
    }
  },

  /**
   * Recovers local stored offline drafts for synchronization sequences
   */
  getOfflineSavedProposals(): any[] {
    try {
      return JSON.parse(localStorage.getItem('ddsulf_offline_quotes') || '[]');
    } catch {
      return [];
    }
  },

  /**
   * Safe wipe for sync processes
   */
  clearOfflineSavedProposals(): void {
    localStorage.removeItem('ddsulf_offline_quotes');
  }
};
