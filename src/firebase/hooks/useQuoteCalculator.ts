import { useState, useEffect } from 'react';
import { quotesService } from '@/services/calculator/quotes';
import { Quote, QuoteStatus } from '@/types/database';

export function useQuoteCalculator() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  async function loadQuotes() {
    try {
      setLoading(true);
      const list = await quotesService.list();
      setQuotes(list);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQuotes();
  }, []);

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
    const newQuote = await quotesService.createQuote(quoteData);
    await loadQuotes();
    return newQuote;
  };

  const changeStatus = async (id: string, newStatus: QuoteStatus) => {
    await quotesService.updateQuoteStatus(id, newStatus);
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
