import { useState, useEffect, useCallback } from 'react';
import { DDSulfKnowledgeService } from '../services/knowledgeService';
import { KnowledgeArticle, Procedure, DocApproval, DocumentCategory } from '../types';

export function useOperationalKnowledge(tenantId: string = 'default_tenant') {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<DocApproval[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const service = DDSulfKnowledgeService.getInstance();

  const loadAllDataName = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const arts = await service.getArticles();
      const procs = await service.getProcedures();
      const approvals = await service.getPendingApprovals();
      
      setArticles(arts);
      setProcedures(procs);
      setPendingApprovals(approvals);
    } catch (e: any) {
      setError(e.message || 'Erro ao carregar ecossistema de conhecimento DDSulf');
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    loadAllDataName();
  }, [loadAllDataName]);

  const viewArticle = useCallback(async (id: string) => {
    try {
      await service.incrementArticleView(id);
      setArticles(prev => prev.map(art => art.id === id ? { ...art, viewCount: art.viewCount + 1 } : art));
      await service.trackDocumentEngagement(id, 'article', 15); // track 15 seconds reading average
    } catch (e) {
      console.error('Error tracking article view engagement:', e);
    }
  }, [service]);

  const likeArticle = useCallback(async (id: string) => {
    try {
      const updatedLikes = await service.toggleLikeArticle(id);
      setArticles(prev => prev.map(art => art.id === id ? { ...art, likes: updatedLikes } : art));
    } catch (e) {
      console.error(e);
    }
  }, [service]);

  const createNewArticleProposal = useCallback(async (title: string, content: string, category: DocumentCategory, tags: string[], authorName: string) => {
    try {
      const newArticleProposal = await service.createArticle({
        tenantId,
        title,
        content,
        category,
        tags,
        authorId: 'user_rt_1',
        authorName,
        isPublished: true,
        version: 1
      });
      setArticles(prev => [...prev, newArticleProposal]);
      return newArticleProposal;
    } catch (e: any) {
      throw new Error(e.message || 'Falha ao criar artigo operacional');
    }
  }, [service, tenantId]);

  const requestDocumentChangeApproval = useCallback(async (
    documentId: string, 
    documentType: 'article' | 'procedure', 
    proposedTitle: string, 
    proposedContentJSON: string, 
    authorId: string, 
    authorName: string
  ) => {
    try {
      const req = await service.submitDocForApproval({
        tenantId,
        documentId,
        documentType,
        proposedTitle,
        proposedContentJSON,
        authorId,
        authorName
      });
      setPendingApprovals(prev => [req, ...prev]);
      return req;
    } catch (e: any) {
      throw new Error(e.message || 'Falha ao criar proposta de alteração documental');
    }
  }, [service, tenantId]);

  const executeApprovalAction = useCallback(async (approvalId: string, status: 'approved' | 'rejected', reviewerName: string, feedback?: string) => {
    try {
      const reviewed = await service.reviewDocProposed(approvalId, status, reviewerName, feedback);
      if (reviewed) {
        setPendingApprovals(prev => prev.filter(item => item.id !== approvalId));
        // Reload master documents to reflect approved changes
        const arts = await service.getArticles();
        const procs = await service.getProcedures();
        setArticles(arts);
        setProcedures(procs);
      }
    } catch (e: any) {
      throw new Error(e.message || 'Falha ao processar revisão de compliance');
    }
  }, [service]);

  return {
    articles,
    procedures,
    pendingApprovals,
    loading,
    error,
    refreshKnowledge: loadAllDataName,
    viewArticle,
    likeArticle,
    createNewArticleProposal,
    requestDocumentChangeApproval,
    executeApprovalAction
  };
}
