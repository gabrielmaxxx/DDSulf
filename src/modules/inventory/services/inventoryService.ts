import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  where, 
  doc, 
  updateDoc,
  serverTimestamp,
  runTransaction
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import { Product, StockMovement } from '@/types/database';

export const inventoryService = {
  async getProducts() {
    const q = query(collection(db, 'products'), orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Product);
  },

  async addProduct(product: Omit<Product, 'id'>) {
    return addDoc(collection(db, 'products'), {
      ...product,
      updatedAt: new Date().toISOString()
    });
  },

  async updateStock(productId: string, quantityChange: number, type: 'Entrada' | 'Saída', userId: string, serviceId?: string) {
    const productRef = doc(db, 'products', productId);
    const movementRef = collection(db, 'stock_movements');

    return runTransaction(db, async (transaction) => {
      const productSnap = await transaction.get(productRef);
      if (!productSnap.exists()) throw new Error("Produto não encontrado");

      const currentStock = productSnap.data().quantityAvailable || 0;
      const newStock = type === 'Entrada' ? currentStock + quantityChange : currentStock - quantityChange;

      if (newStock < 0) throw new Error("Estoque insuficiente");

      // Update product stock
      transaction.update(productRef, {
        quantityAvailable: newStock,
        updatedAt: new Date().toISOString()
      });

      // Record movement
      const movementData: Omit<StockMovement, 'id'> = {
        productId,
        type,
        quantity: quantityChange,
        responsibleUser: userId,
        relatedServiceId: serviceId,
        createdAt: new Date().toISOString()
      };
      
      const newMovementRef = doc(movementRef);
      transaction.set(newMovementRef, movementData);
    });
  },

  async getMovements(productId?: string) {
    let q = query(collection(db, 'stock_movements'), orderBy('createdAt', 'desc'));
    if (productId) {
      q = query(q, where('productId', '==', productId));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as StockMovement);
  }
};
