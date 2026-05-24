import { useState, useEffect } from 'react';
import { productsService, stockMovementsService } from '@/services/inventory/inventory';
import { Product, StockMovement } from '@/types/database';

export function useProductInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [understockAlerts, setUnderstockAlerts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  async function loadInventory() {
    try {
      setLoading(true);
      const allProducts = await productsService.list();
      const alerts = await productsService.getUnderstockAlerts();
      setProducts(allProducts);
      setUnderstockAlerts(alerts);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInventory();

    // Setup simple listener for product movements to trigger update
    const unsubscribeMovement = stockMovementsService.subscribeList({}, () => {
      loadInventory();
    });

    return () => {
      unsubscribeMovement();
    };
  }, []);

  const executeMovement = async (movement: Omit<StockMovement, 'id' | 'createdAt'>) => {
    await stockMovementsService.registerMovement(movement);
    await loadInventory();
  };

  const createNewProduct = async (product: Omit<Product, 'id' | 'updatedAt'>) => {
    await productsService.create({
      ...product,
      updatedAt: new Date().toISOString()
    } as any);
    await loadInventory();
  };

  return {
    products,
    understockAlerts,
    loading,
    error,
    refresh: loadInventory,
    registerMovement: executeMovement,
    createProduct: createNewProduct
  };
}

export default useProductInventory;
