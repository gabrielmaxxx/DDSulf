import { useState, useEffect } from 'react';
import { useOperationalKnowledge } from './useOperationalKnowledge';
import { KnowledgeArticle, Procedure, DocumentCategory } from '../types';

export function useContextualLearning(currentPageContext: 'dashboard' | 'chemicals' | 'stock' | 'routes' | 'finance' | 'safety' | 'pops') {
  const { articles, procedures, loading } = useOperationalKnowledge();
  const [recommendedArticles, setRecommendedArticles] = useState<KnowledgeArticle[]>([]);
  const [recommendedProcedures, setRecommendedProcedures] = useState<Procedure[]>([]);

  useEffect(() => {
    if (loading) return;

    let targetCategories: DocumentCategory[] = [];
    let pPests: string[] = [];

    switch (currentPageContext) {
      case 'chemicals':
      case 'stock':
        targetCategories = ['chemical', 'operational', 'regulatory'];
        break;
      case 'finance':
        targetCategories = ['commercial', 'regulatory'];
        break;
      case 'safety':
      case 'pops':
        targetCategories = ['safety', 'regulatory', 'operational'];
        break;
      case 'routes':
        targetCategories = ['operational', 'safety'];
        break;
      default:
        targetCategories = ['operational', 'regulatory'];
        break;
    }

    const filteredArticles = articles.filter(art => targetCategories.includes(art.category) && art.isPublished);
    const filteredProcs = procedures.filter(proc => targetCategories.includes(proc.category) && proc.isPublished);

    setRecommendedArticles(filteredArticles.slice(0, 2));
    setRecommendedProcedures(filteredProcs.slice(0, 2));

  }, [articles, procedures, loading, currentPageContext]);

  return {
    recommendedArticles,
    recommendedProcedures,
    loadingContextRecommendations: loading
  };
}
