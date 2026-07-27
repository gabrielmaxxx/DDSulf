import { db, auth } from '@/services/firebase';
import { collection, addDoc, getDocs, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { PricingInputs, PricingBreakdown, ProductCostItem, PricingSimulation } from '../types';
import { processOperationalPricing, DEFAULT_ENGINE_SETTINGS } from '../calculations/pricingEngine';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
    },
    operationType,
    path,
  };
  console.error('[Pricing Firestore Error]: ', JSON.stringify(errInfo, null, 2));
  throw new Error(JSON.stringify(errInfo));
}

export const pricingService = {
  /**
   * Fetches the registered operational chemical inventory options
   */
  async getChemicalProducts(): Promise<ProductCostItem[]> {
    // In normal environments, retrieve chemicals from 'inventory' or 'products' Firestore path.
    // We return a high-fidelity list as the reactive system baseline.
    const defaultChemicals: ProductCostItem[] = [
      { id: 'prod_fipronil', name: 'Fipronil 80 WG (Termicida High Performance)', dosagePerM2: 0.15, unitCost: 1.25, unitLabel: 'g', amountUsed: 0, totalCost: 0 },
      { id: 'prod_deltametrina', name: 'Deltametrina 25 EC (Inseticida Residual)', dosagePerM2: 0.25, unitCost: 0.85, unitLabel: 'ml', amountUsed: 0, totalCost: 0 },
      { id: 'prod_fendona', name: 'Fendona Pro (Suspensão Concentrada)', dosagePerM2: 0.1, unitCost: 1.55, unitLabel: 'ml', amountUsed: 0, totalCost: 0 },
      { id: 'prod_temprid', name: 'Temprid SC (Dupla Ação Neocoticóide)', dosagePerM2: 0.2, unitCost: 1.95, unitLabel: 'ml', amountUsed: 0, totalCost: 0 },
      { id: 'prod_raticida', name: 'Raticida Grãos Integ - Bromadiolona', dosagePerM2: 0.05, unitCost: 0.45, unitLabel: 'g', amountUsed: 0, totalCost: 0 },
    ];
    
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      if (querySnapshot.empty) {
        return defaultChemicals;
      }
      const products: ProductCostItem[] = [];
      querySnapshot.forEach(doc => {
        const d = doc.data();
        if (d.type === 'Química' || d.category === 'Inseticidas') {
          products.push({
            id: doc.id,
            name: d.name || 'Químico Desconhecido',
            dosagePerM2: d.standardDosage || 0.2,
            unitCost: d.unitCost || 0.75,
            unitLabel: d.unitLabel || 'ml',
            amountUsed: 0,
            totalCost: 0
          });
        }
      });
      return products.length > 0 ? products : defaultChemicals;
    } catch (error) {
      console.warn('Fallback to local high-performance chemical database due to setup state:', error);
      return defaultChemicals;
    }
  },

  /**
   * Saves simulated quotes dynamically in Firestore or triggers compliant fallback behavior
   */
  async saveQuote(inputs: PricingInputs, breakdown: PricingBreakdown): Promise<string> {
    const collName = 'quotes';
    const payload = {
      clientName: inputs.clientName || 'Simulação Sem Nome',
      pestType: inputs.pestType,
      environmentType: inputs.environmentType,
      areaSize: Number(inputs.areaSize),
      infestationLevel: inputs.infestationLevel,
      operationalComplexity: inputs.complexity,
      recurrence: inputs.recurrence,
      urgency: inputs.urgency,
      displacement: Number(inputs.displacement),
      estimatedTime: breakdown.estimatedTimeHours,
      suggestedPrice: breakdown.suggestedPrice,
      estimatedCost: breakdown.totalOperationalCost,
      estimatedMargin: breakdown.actualMarginPercent,
      suggestedTeam: inputs.technicians,
      chemicalDetails: inputs.selectedProducts.map(p => ({
        id: p.id,
        name: p.name,
        dosagePerM2: p.dosagePerM2,
        unitCost: p.unitCost,
        amountUsed: p.amountUsed,
        totalCost: p.totalCost
      })),
      status: 'Proposta',
      createdBy: auth?.currentUser?.uid || 'anon_pricing_agent',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      serverTimestamp: serverTimestamp()
    };

    try {
      const docRef = await addDoc(collection(db, collName), payload);
      return docRef.id;
    } catch (err) {
      // Catch permission failures securely per System instructions
      console.error('[saveQuote Service Error]', err);
      // Let's verify if permission is denied, or generic auth error
      if (err instanceof Error && (err.message.includes('permission') || err.message.includes('unauthenticated'))) {
        handleFirestoreError(err, OperationType.WRITE, collName);
      }
      
      // Secondary fallback offline state
      const id = 'offline_quote_' + Date.now();
      const offlineQuotes = JSON.parse(localStorage.getItem('offline_quotes') || '[]');
      offlineQuotes.unshift({ ...payload, id });
      localStorage.setItem('offline_quotes', JSON.stringify(offlineQuotes));
      return id;
    }
  },

  /**
   * Draft Recovery autosave logic
   */
  saveDraft(inputs: PricingInputs): void {
    try {
      localStorage.setItem('pestflow_pricing_draft', JSON.stringify({
        inputs,
        timestamp: new Date().toISOString()
      }));
    } catch (e) {
      console.error('[saveDraft error]:', e);
    }
  },

  getDraft(): PricingInputs | null {
    try {
      const saved = localStorage.getItem('pestflow_pricing_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.inputs as PricingInputs;
      }
    } catch (e) {
      console.error('[getDraft error]:', e);
    }
    return null;
  },

  clearDraft(): void {
    try {
      localStorage.removeItem('pestflow_pricing_draft');
    } catch (e) {
      console.error('[clearDraft error]:', e);
    }
  }
};
