import { useState, useEffect } from 'react';
import { productsService, stockMovementsService } from '@/services/inventory/inventory';
import { Product, StockMovement } from '@/types/database';
import { DEFAULT_EMPRESA_ID } from '@/tenant';

export function useProductInventory(empresaId: string = DEFAULT_EMPRESA_ID) {
  const [products, setProducts] = useState<Product[]>([]);
  const [understockAlerts, setUnderstockAlerts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  async function loadInventory() {
    try {
      setLoading(true);
      const allProducts = await productsService.list(empresaId);
      const alerts = await productsService.getUnderstockAlerts(empresaId);
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
    const unsubscribeMovement = stockMovementsService.subscribeList(empresaId, {}, () => {
      loadInventory();
    });

    return () => {
      unsubscribeMovement();
    };
  }, [empresaId]);

  const executeMovement = async (movement: Omit<StockMovement, 'id' | 'createdAt'>) => {
    await stockMovementsService.registerMovement(empresaId, movement);
    await loadInventory();
  };

  const createNewProduct = async (product: Omit<Product, 'id' | 'updatedAt'>) => {
    await productsService.create(empresaId, {
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
