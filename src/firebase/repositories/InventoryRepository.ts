/**
 * Domain-specific Repository class for Inventory items and Stock balances with multi-tenant support
 */

import { BaseRepository } from './BaseRepository';
import { Product, StockMovement } from '../types/enterprise';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../config';
import { handleFirestoreError } from '../utils/errorHandler';
import { OperationType } from '../types';
import { getTenantCollectionPath } from '../../tenant';

export class InventoryRepository extends BaseRepository<Product> {
  protected readonly collectionName = 'products';

  public static instance = new InventoryRepository();

  /**
   * Retrieves all items that meet or are below minimum stock limits in tenant scope
   */
  public async getDepletedStockProducts(empresaId: string): Promise<Product[]> {
    try {
      const path = this.getTenantPath(empresaId);
      const colRef = collection(db, path);
      const snapshot = await getDocs(colRef);
      const allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Product);
      
      return allProducts.filter(p => p.quantityAvailable <= p.minimumStock);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, `${this.collectionName}:depleted`);
      return [];
    }
  }

  /**
   * Stream stock movements for audit review in tenant scope
   */
  public async getStockMovements(empresaId: string, productId: string, maxLimit = 50): Promise<StockMovement[]> {
    try {
      const movementsPath = getTenantCollectionPath(empresaId, 'stock_movements');
      const q = query(
        collection(db, movementsPath),
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
