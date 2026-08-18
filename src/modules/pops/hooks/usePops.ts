import { useState, useEffect, useMemo } from 'react';
import { popService } from '../services/popService';
import { POP } from '@/types/database';
import { useAuth } from '@/auth/hooks/useAuth';

export function usePops() {
  const { empresaId } = useAuth();
  const [pops, setPops] = useState<POP[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!empresaId) return;
      try {
        setLoading(true);
        const data = await popService.getPops(empresaId);
        setPops(data || []);
      } catch (err) {
        console.error('Error loading POPs:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [empresaId]);

  const filteredPops = useMemo(() => {
    return pops.filter(pop => {
      const matchesSearch = pop.title.toLowerCase().includes(search.toLowerCase()) || 
                           pop.description.toLowerCase().includes(search.toLowerCase()) ||
                           pop.pestType?.toLowerCase().includes(search.toLowerCase());
      
      const matchesCategory = !selectedCategory || pop.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [pops, search, selectedCategory]);

  const categories = useMemo(() => {
    const cats = new Set(pops.map(p => p.category));
    return Array.from(cats);
  }, [pops]);

  return {
    pops: filteredPops,
    allPops: pops,
    categories,
    loading,
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory
  };
}
