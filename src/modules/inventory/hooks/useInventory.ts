import { useState, useEffect, useMemo } from 'react';
import { inventoryService } from '../services/inventoryService';
import { Product } from '@/types/database';
import { useAuth } from '@/auth/hooks/useAuth';

export function useInventory() {
  const { empresaId } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const loadProducts = async () => {
    if (!empresaId) return;
    setLoading(true);
    try {
      const data = await inventoryService.getProducts(empresaId);
      if (data.length > 0) {
        setProducts(data);
      } else {
        // Mock data if Firestore is empty for demo/initial state
        setProducts([
          {
            id: 'prod-1',
            name: 'K-Othrine SC 25',
            category: 'Inseticidas',
            manufacturer: 'Bayer',
            unit: 'L',
            unitCost: 120,
            quantityAvailable: 15,
            minimumStock: 5,
            updatedAt: new Date().toISOString()
          },
          {
            id: 'prod-2',
            name: 'Rodilon Bloco Especial',
            category: 'Raticidas',
            manufacturer: 'Bayer',
            unit: 'Kg',
            unitCost: 85,
            quantityAvailable: 3,
            minimumStock: 10,
            updatedAt: new Date().toISOString()
          },
          {
            id: 'prod-3',
            name: 'Máscara PFF3',
            category: 'EPIs',
            unit: 'Un',
            unitCost: 12,
            quantityAvailable: 45,
            minimumStock: 20,
            updatedAt: new Date().toISOString()
          }
        ]);
      }
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [empresaId]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.manufacturer?.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const alerts = useMemo(() => {
    return products.filter(p => p.quantityAvailable <= p.minimumStock);
  }, [products]);

  return {
    products: filteredProducts,
    allProducts: products,
    loading,
    search,
    setSearch,
    alerts,
    refresh: loadProducts
  };
}
