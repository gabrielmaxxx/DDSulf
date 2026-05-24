import { useQuoteCalculator as useFirebaseQuoteCalculator } from '@/firebase/hooks/useQuoteCalculator';

export function useQuoteCalculator() {
  const data = useFirebaseQuoteCalculator();
  return {
    quotes: data.quotes,
    isLoading: data.loading,
    error: data.error,
    refresh: data.refresh,
    calculate: data.calculate,
    createProposal: data.createProposal,
    updateStatus: data.updateStatus
  };
}

export default useQuoteCalculator;
