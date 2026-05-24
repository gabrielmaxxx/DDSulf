import { useState, useMemo } from 'react';
import { KnowledgeArticle, Procedure, DocumentCategory } from '../types';

export function useKnowledgeSearch(articles: KnowledgeArticle[], procedures: Procedure[]) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | 'all'>('all');
  const [selectedTag, setSelectedTag] = useState<string | 'all'>('all');

  // Dynamically extract all unique tags from articles for granular sidebar buttons
  const availableTags = useMemo(() => {
    const tagsSet = new Set<string>();
    articles.forEach(art => {
      art.tags?.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet);
  }, [articles]);

  const filteredResults = useMemo(() => {
    const queryNormalized = searchQuery.toLowerCase().trim();

    // 1. Filter articles
    const matchedArticles = articles.filter(art => {
      if (!art.isPublished) return false;
      
      const categoryMatches = selectedCategory === 'all' || art.category === selectedCategory;
      const tagMatches = selectedTag === 'all' || art.tags?.includes(selectedTag);
      
      const textMatches = queryNormalized === '' || 
        art.title.toLowerCase().includes(queryNormalized) ||
        art.content.toLowerCase().includes(queryNormalized) ||
        art.tags?.some(t => t.toLowerCase().includes(queryNormalized));

      return categoryMatches && tagMatches && textMatches;
    });

    // 2. Filter procedures
    const matchedProcedures = procedures.filter(proc => {
      if (!proc.isPublished) return false;

      const categoryMatches = selectedCategory === 'all' || proc.category === selectedCategory;
      // Procedures typically don't store strict search-tags but have targetPests
      const tagMatches = selectedTag === 'all' || proc.targetPests?.some(p => p.toLowerCase() === selectedTag.toLowerCase());

      const textMatches = queryNormalized === '' ||
        proc.title.toLowerCase().includes(queryNormalized) ||
        proc.description.toLowerCase().includes(queryNormalized) ||
        proc.targetPests?.some(p => p.toLowerCase().includes(queryNormalized));

      return categoryMatches && tagMatches && textMatches;
    });

    return {
      articles: matchedArticles,
      procedures: matchedProcedures,
      totalCount: matchedArticles.length + matchedProcedures.length
    };
  }, [articles, procedures, searchQuery, selectedCategory, selectedTag]);

  return {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedTag,
    setSelectedTag,
    availableTags,
    filteredResults
  };
}
