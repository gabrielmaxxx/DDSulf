import { db, auth } from '@/services/firebase';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { QuoteWorkflowState } from '../types';
import { ProductCostItem, PricingBreakdown } from '../../types';
import { tenantStorage } from '@/utils/storage';

export const workflowService = {
  /**
   * Fetches the registered products or defaults securely
   */
  async getChemicalProducts(): Promise<ProductCostItem[]> {
    const defaultChemicals: ProductCostItem[] = [
      { id: 'prod_fipronil', name: 'Fipronil 80 WG (Termicida High Performance)', dosagePerM2: 0.15, unitCost: 1.25, unitLabel: 'g', amountUsed: 0, totalCost: 0 },
      { id: 'prod_deltametrina', name: 'Deltametrina 25 EC (Inseticida Residual)', dosagePerM2: 0.25, unitCost: 0.85, unitLabel: 'ml', amountUsed: 0, totalCost: 0 },
      { id: 'prod_fendona', name: 'Fendona Pro (Suspensão Concentrada)', dosagePerM2: 0.1, unitCost: 1.55, unitLabel: 'ml', amountUsed: 0, totalCost: 0 },
      { id: 'prod_temprid', name: 'Temprid SC (Dupla Ação Neocoticóide)', dosagePerM2: 0.2, unitCost: 1.95, unitLabel: 'ml', amountUsed: 0, totalCost: 0 },
      { id: 'prod_raticida', name: 'Raticida Grãos Integ - Bromadiolona', dosagePerM2: 0.05, unitCost: 0.45, unitLabel: 'g', amountUsed: 0, totalCost: 0 },
    ];

    try {
      const snap = await getDocs(collection(db, 'products'));
      if (snap.empty) return defaultChemicals;
      
      const loaded: ProductCostItem[] = [];
      snap.forEach(doc => {
        const d = doc.data();
        if (d.type === 'Química' || d.category === 'Inseticidas') {
          loaded.push({
            id: doc.id,
            name: d.name || 'Químico',
            dosagePerM2: d.standardDosage || 0.2,
            unitCost: d.unitCost || 0.8,
            unitLabel: d.unitLabel || 'ml',
            amountUsed: 0,
            totalCost: 0
          });
        }
      });
      return loaded.length > 0 ? loaded : defaultChemicals;
    } catch {
      return defaultChemicals;
    }
  },

  /**
   * Commits the fully formed operational workflow quote to database
   */
  async finalizeQuote(state: QuoteWorkflowState, breakdown: PricingBreakdown): Promise<string> {
    const collName = 'quotes';
    const payload = {
      clientName: state.clientName,
      clientPhone: state.clientPhone,
      clientEmail: state.clientEmail,
      pestType: state.pestType,
      environmentType: state.environmentType,
      areaSize: Number(state.areaSize),
      infestationLevel: state.infestationLevel,
      operationalComplexity: state.complexity,
      recurrence: state.recurrence,
      urgency: state.urgency,
      displacement: Number(state.displacement),
      estimatedTime: breakdown.estimatedTimeHours,
      suggestedPrice: breakdown.suggestedPrice,
      estimatedCost: breakdown.totalOperationalCost,
      estimatedMargin: breakdown.actualMarginPercent,
      suggestedTeam: state.technicians,
      chemicalDetails: state.selectedProducts.map(p => ({
        id: p.id,
        name: p.name,
        dosagePerM2: p.dosagePerM2,
        unitCost: p.unitCost,
        amountUsed: p.amountUsed,
        totalCost: p.totalCost
      })),
      notes: state.notes || '',
      classification: breakdown.actualMarginPercent >= 55 ? 'Premium' : 'Padrão',
      status: 'Proposta',
      createdBy: auth?.currentUser?.uid || 'anon_pricing_agent',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      serverTimestamp: serverTimestamp()
    };

    try {
      const docRef = await addDoc(collection(db, collName), payload);
      return docRef.id;
    } catch (e) {
      console.warn('Network timeout or permission deficit. Storing quote in Local Queue.');
      const localId = `local_quote_${Date.now()}`;
      const localList = JSON.parse(tenantStorage.getItem('offline_quotes') || '[]');
      localList.unshift({ ...payload, id: localId });
      tenantStorage.setItem('offline_quotes', JSON.stringify(localList));
      return localId;
    }
  },

  /**
   * Tracks user interaction events for workflow efficiency audit metrics
   */
  trackAnalytics(eventAction: string, metadata: any): void {
    try {
      const history = JSON.parse(tenantStorage.getItem('workflow_analytics') || '[]');
      history.push({
        event: eventAction,
        metadata,
        timestamp: new Date().toISOString()
      });
      tenantStorage.setItem('workflow_analytics', JSON.stringify(history.slice(-100))); // Cap at 100
    } catch {}
  }
};
