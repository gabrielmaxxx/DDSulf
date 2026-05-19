import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  where, 
  doc, 
  getDoc, 
  setDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import { FinancialCost, Revenue, FinancialSettings } from '@/types/database';

export const financialService = {
  // Costs
  async addCost(cost: Omit<FinancialCost, 'id'>) {
    return addDoc(collection(db, 'financial_costs'), {
      ...cost,
      serverTimestamp: serverTimestamp()
    });
  },

  async getCosts(limitCount = 100) {
    const q = query(collection(db, 'financial_costs'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as FinancialCost);
  },

  // Revenues
  async addRevenue(revenue: Omit<Revenue, 'id'>) {
    return addDoc(collection(db, 'revenues'), {
      ...revenue,
      serverTimestamp: serverTimestamp()
    });
  },

  async getRevenues() {
    const q = query(collection(db, 'revenues'), orderBy('receivedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Revenue);
  },

  // Settings
  async getSettings(): Promise<FinancialSettings> {
    const docRef = doc(db, 'financial_settings', 'default');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as FinancialSettings;
    }
    // Default fallback
    return {
      id: 'default',
      costPerHour: 45,
      costPerKm: 2.5,
      minimumMargin: 30,
      baseOperationalCost: 80,
      updatedAt: new Date().toISOString()
    };
  },

  async updateSettings(settings: Partial<FinancialSettings>) {
    const docRef = doc(db, 'financial_settings', 'default');
    return setDoc(docRef, {
      ...settings,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  }
};
