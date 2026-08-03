import { useState, useEffect } from 'react';
import { quotesService } from '@/services/calculator/quotes';
import { Quote, QuoteStatus } from '@/types/database';
import { useAuth } from '@/auth/hooks/useAuth';

export function useQuoteCalculator(passedEmpresaId?: string) {
  const { empresaId: authEmpresaId } = useAuth();
  const empresaId = passedEmpresaId || authEmpresaId || '';

  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  async function loadQuotes() {
    if (!empresaId) return;
    try {
      setLoading(true);
      const list = await quotesService.list(empresaId);
      setQuotes(list);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQuotes();
  }, [empresaId]);

  const calculateEstimate = (params: {
    areaSize: number;
    pestType: string;
    environmentType: string;
    infestationLevel: 'Baixo' | 'Médio' | 'Alto' | 'Crítico';
    displacementKm: number;
    teamSize: number;
  }) => {
    return quotesService.calculateProposal(params);
  };

  const createProposal = async (quoteData: Omit<Quote, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    if (!empresaId) throw new Error("empresaId ausente");
    const newQuote = await quotesService.createQuote(empresaId, quoteData);
    await loadQuotes();
    return newQuote;
  };

  const changeStatus = async (id: string, newStatus: QuoteStatus) => {
    if (!empresaId) throw new Error("empresaId ausente");
    await quotesService.updateQuoteStatus(empresaId, id, newStatus);
    await loadQuotes();
  };

  return {
    quotes,
    loading,
    error,
    refresh: loadQuotes,
    calculate: calculateEstimate,
    createProposal,
    updateStatus: changeStatus
  };
}

export default useQuoteCalculator;
