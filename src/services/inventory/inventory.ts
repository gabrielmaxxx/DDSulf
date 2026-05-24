import { BaseFirestoreService } from '../firestore/BaseFirestoreService';
import { Product, StockMovement } from '@/types/database';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { logOperationalEvent } from '@/firebase/analytics';

export class ProductsService extends BaseFirestoreService<Product> {
  constructor() {
    super('products');
  }

  /**
   * Retrieves products with stocks lower than warning thresholds
   */
  async getUnderstockAlerts(): Promise<Product[]> {
    const allProducts = await this.list();
    return allProducts.filter(p => p.quantityAvailable <= p.minimumStock);
  }
}

export class StockMovementsService extends BaseFirestoreService<StockMovement> {
  constructor() {
    super('stock_movements');
  }

  /**
   * High consistency transaction to process a compound product movement
   * Validates available stock levels and commits changes atomically
   */
  async registerMovement(movement: Omit<StockMovement, 'id' | 'createdAt'>): Promise<void> {
    logOperationalEvent('stock_movement_requested', { 
      productId: movement.productId, 
      type: movement.type, 
      qty: movement.quantity 
    });

    const movementPayload = {
      ...movement,
      createdAt: new Date().toISOString()
    };

    // Perform atomic transaction checking so stocks can never drop below zero
    await this.runAtomicTransaction(async (transaction) => {
      const productRef = doc(db, 'products', movement.productId);
      const productSnap = await transaction.get(productRef);

      if (!productSnap.exists()) {
        throw new Error('Transaction aborted: Product reference does not exist inside active databases.');
      }

      const currentProduct = productSnap.data() as Product;
      let targetQty = currentProduct.quantityAvailable;

      if (movement.type === 'Entrada') {
        targetQty += movement.quantity;
      } else if (movement.type === 'Saída') {
        if (targetQty < movement.quantity) {
          throw new Error(`Estoque Insuficiente: Tentativa de retirar ${movement.quantity} ${currentProduct.unit} de ${currentProduct.name}. Saldo em estoque: ${targetQty}`);
        }
        targetQty -= movement.quantity;
      }

      // 1. Log the stock audit movement
      const movementRef = doc(this.getCollectionRef());
      transaction.set(movementRef, movementPayload);

      // 2. Adjust core quantity available
      transaction.update(productRef, {
        quantityAvailable: targetQty,
        updatedAt: new Date().toISOString()
      });
    });

    logOperationalEvent('stock_movement_completed', { 
      productId: movement.productId, 
      type: movement.type 
    });
  }

  /**
   * Returns complete transaction logs for a specific product
   */
  async getMovementHistory(productId: string): Promise<StockMovement[]> {
    return this.list({
      filters: [
        { field: 'productId', operator: '==', value: productId }
      ],
      orders: [
        { field: 'createdAt', direction: 'desc' }
      ]
    });
  }
}

export const productsService = new ProductsService();
export const stockMovementsService = new StockMovementsService();
export default { productsService, stockMovementsService };
