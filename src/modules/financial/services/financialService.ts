import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  doc, 
  getDoc, 
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import { FinancialCost, Revenue, FinancialSettings } from '@/types/database';
import { getTenantCollectionPath } from '@/tenant';

export const financialService = {
  // Costs
  async addCost(empresaId: string, cost: Omit<FinancialCost, 'id'>): Promise<any> {
    if (!empresaId) throw new Error('empresaId é obrigatório para addCost.');
    try {
      const path = getTenantCollectionPath(empresaId, 'financial_costs');
      return await addDoc(collection(db, path), {
        ...cost,
        serverTimestamp: serverTimestamp()
      });
    } catch (error) {
      console.warn("Operating offline: saving cost to local storage...", error);
      const localCosts = JSON.parse(localStorage.getItem('financial_costs') || '[]');
      const newCost = {
        id: 'local_' + Date.now(),
        ...cost,
        createdAt: cost.createdAt || new Date().toISOString()
      };
      localCosts.unshift(newCost);
      localStorage.setItem('financial_costs', JSON.stringify(localCosts));
      return { id: newCost.id } as any;
    }
  },

  async getCosts(empresaId: string, limitCount: number = 100): Promise<FinancialCost[]> {
    if (!empresaId) throw new Error('empresaId é obrigatório para getCosts.');
    try {
      const path = getTenantCollectionPath(empresaId, 'financial_costs');
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const serverCosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as FinancialCost);
      localStorage.setItem('financial_costs', JSON.stringify(serverCosts));
      return serverCosts;
    } catch (error) {
      console.warn("Operating offline: retrieving costs from local storage...", error);
      const localCosts = JSON.parse(localStorage.getItem('financial_costs') || '[]');
      if (localCosts.length === 0) {
        return [
          {
            id: 'cost_1',
            category: 'Operacional',
            subcategory: 'Inseticida Piretroide 5L',
            amount: 250.00,
            createdBy: 'root',
            createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
          },
          {
            id: 'cost_2',
            category: 'Operacional',
            subcategory: 'Combustível - Unidade Móvel 01',
            amount: 120.00,
            createdBy: 'root',
            createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
          }
        ] as FinancialCost[];
      }
      return localCosts;
    }
  },

  // Revenues
  async addRevenue(empresaId: string, revenue: Omit<Revenue, 'id'>): Promise<any> {
    if (!empresaId) throw new Error('empresaId é obrigatório para addRevenue.');
    try {
      const path = getTenantCollectionPath(empresaId, 'revenues');
      return await addDoc(collection(db, path), {
        ...revenue,
        serverTimestamp: serverTimestamp()
      });
    } catch (error) {
      console.warn("Operating offline: saving revenue to local storage...", error);
      const localRevs = JSON.parse(localStorage.getItem('revenues') || '[]');
      const newRev = {
        id: 'local_' + Date.now(),
        ...revenue,
        receivedAt: revenue.receivedAt || new Date().toISOString()
      };
      localRevs.unshift(newRev);
      localStorage.setItem('revenues', JSON.stringify(localRevs));
      return { id: newRev.id } as any;
    }
  },

  async getRevenues(empresaId: string): Promise<Revenue[]> {
    if (!empresaId) throw new Error('empresaId é obrigatório para getRevenues.');
    try {
      const path = getTenantCollectionPath(empresaId, 'revenues');
      const q = query(collection(db, path), orderBy('receivedAt', 'desc'));
      const snapshot = await getDocs(q);
      const serverRevs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Revenue);
      localStorage.setItem('revenues', JSON.stringify(serverRevs));
      return serverRevs;
    } catch (error) {
      console.warn("Operating offline: retrieving revenues from local storage...", error);
      const localRevs = JSON.parse(localStorage.getItem('revenues') || '[]');
      if (localRevs.length === 0) {
        return [
          {
            id: 'rev_1',
            clientId: 'Condomínio Bem Viver',
            category: 'Mensalidade',
            amount: 1450.00,
            paymentMethod: 'Pix',
            receivedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
            createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
          },
          {
            id: 'rev_2',
            clientId: 'Padaria Delícia',
            category: 'Avulso',
            amount: 450.00,
            paymentMethod: 'Dinheiro',
            receivedAt: new Date(Date.now() - 3600000 * 36).toISOString(),
            createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
          }
        ] as Revenue[];
      }
      return localRevs;
    }
  },

  // Settings
  async getSettings(empresaId: string): Promise<FinancialSettings> {
    if (!empresaId) throw new Error('empresaId é obrigatório para getSettings.');
    try {
      const path = getTenantCollectionPath(empresaId, 'financial_settings');
      const docRef = doc(db, path, 'default');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as FinancialSettings;
        localStorage.setItem('financial_settings', JSON.stringify(data));
        return data;
      }
    } catch (error) {
      console.warn("Operating offline: fetching settings from local storage...", error);
    }

    const savedSettings = localStorage.getItem('financial_settings');
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch (e) {}
    }

    return {
      id: 'default',
      costPerHour: 45,
      costPerKm: 2.5,
      minimumMargin: 30,
      baseOperationalCost: 80,
      updatedAt: new Date().toISOString()
    };
  },

  async updateSettings(empresaId: string, settings: Partial<FinancialSettings>): Promise<FinancialSettings> {
    if (!empresaId) throw new Error('empresaId é obrigatório para updateSettings.');
    try {
      const path = getTenantCollectionPath(empresaId, 'financial_settings');
      const docRef = doc(db, path, 'default');
      await setDoc(docRef, {
        ...settings,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.warn("Operating offline: updating settings in local storage...", error);
    }
    
    const current = await this.getSettings(empresaId);
    const updated = {
      ...current,
      ...settings,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('financial_settings', JSON.stringify(updated));
    return updated;
  }
};
