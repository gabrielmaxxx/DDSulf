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
      setProducts(data || []);
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
