import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  where,
  addDoc,
  serverTimestamp,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import { POP } from '@/types/database';

export const popService = {
  async getPops() {
    const q = query(collection(db, 'pops'), orderBy('title', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as POP);
  },

  async filterPops(category?: string, pestType?: string) {
    let q = query(collection(db, 'pops'));
    
    if (category) {
      q = query(q, where('category', '==', category));
    }
    
    if (pestType) {
      q = query(q, where('pestType', '==', pestType));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as POP);
  },

  async getPopById(id: string) {
    const docRef = doc(db, 'pops', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as POP;
    }
    return null;
  }
};
