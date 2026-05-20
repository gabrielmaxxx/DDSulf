import { useState, useEffect, useMemo } from 'react';
import { popService } from '../services/popService';
import { POP } from '@/types/database';

export function usePops() {
  const [pops, setPops] = useState<POP[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await popService.getPops();
        if (data.length > 0) {
          setPops(data);
        } else {
          // Fallback mock data
          setPops([
            {
              id: 'mock-1',
              title: 'Desinsetização de Áreas Internas',
              category: 'Geral',
              pestType: 'Baratas',
              description: 'Procedimento padrão para controle de insetos rasteiros em ambientes internos residenciais e comerciais.',
              riskLevel: 'Médio',
              epis: ['Máscara PFF3', 'Luvas Nitrílicas', 'Viseira', 'Macacão Impermeável'],
              recommendedProducts: ['K-Othrine SC 25', 'Goma de Gel Baraticida'],
              checklist: ['Inspeção de ralos', 'Vedação de frestas', 'Identificação de focos', 'Aplicação perimetral'],
              protocols: [
                { step: 'Inspeção Inicial', description: 'Identificar os principais focos de infestação e caminhos de tráfego das pragas.' },
                { step: 'Preparo da Calda', description: 'Diluir o produto conforme recomendação do fabricante (20ml para 5L de água).' },
                { step: 'Aplicação', description: 'Aplicar pulverização em frestas, rodapés e áreas de difícil acesso.' }
              ],
              updatedAt: new Date().toISOString()
            },
            {
              id: 'mock-2',
              title: 'Desratização em Áreas Externas',
              category: 'Especializado',
              pestType: 'Ratos',
              description: 'Controle de roedores em perímetros externos utilizando porta-iscas de segurança.',
              riskLevel: 'Alto',
              epis: ['Luvas Nitrílicas', 'Máscara de Proteção', 'Botas de PVC'],
              recommendedProducts: ['Bloco Extrusado Parafinado', 'Isca Granulada'],
              checklist: ['Verificação de tocas', 'Instalação de porta-iscas', 'Mapeamento de pontos', 'Limpeza de resíduos'],
              protocols: [
                { step: 'Mapeamento', description: 'Identificar trilhas e locais de alimentação nas áreas externas.' },
                { step: 'Ancoragem', description: 'Fixar os porta-iscas em locais estratégicos e inacessíveis a crianças/pets.' }
              ],
              updatedAt: new Date().toISOString()
            }
          ]);
        }
      } catch (err) {
        console.error('Error loading POPs:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

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
