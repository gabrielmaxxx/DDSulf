/**
 * Domain-specific Repository class for Inventory items and Stock balances
 */

import { BaseRepository } from './BaseRepository';
import { Product, StockMovement } from '../types/enterprise';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../config';
import { handleFirestoreError } from '../utils/errorHandler';
import { OperationType } from '../types';

export class InventoryRepository extends BaseRepository<Product> {
  protected readonly collectionName = 'products';

  public static instance = new InventoryRepository();

  /**
   * Retrieves all items that meet or are below minimum stock limits
   */
  public async getDepletedStockProducts(): Promise<Product[]> {
    try {
      // Return lists that require prompt supplier ordering
      const colRef = collection(db, this.collectionName);
      const snapshot = await getDocs(colRef);
      const allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Product);
      
      return allProducts.filter(p => p.quantityAvailable <= p.minimumStock);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, `${this.collectionName}:depleted`);
      return [];
    }
  }

  /**
   * Stream stock movements for audit review
   */
  public async getStockMovements(productId: string, maxLimit = 50): Promise<StockMovement[]> {
    try {
      const q = query(
        collection(db, 'stock_movements'),
        where('productId', '==', productId),
        orderBy('createdAt', 'desc'),
        limit(maxLimit)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as StockMovement);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, `stock_movements:product:${productId}`);
      return [];
    }
  }
}

export const inventoryRepository = InventoryRepository.instance;
