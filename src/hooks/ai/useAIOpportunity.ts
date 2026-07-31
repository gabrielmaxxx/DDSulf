import { useState, useCallback } from 'react';
import { AIService, AISuggestionResponse } from '@/services/ai/ai';
import { DEFAULT_EMPRESA_ID } from '@/tenant';

export function useAIOpportunity(empresaId: string = DEFAULT_EMPRESA_ID) {
  const [suggestion, setSuggestion] = useState<AISuggestionResponse | null>(null);
  const [vulnerabilities, setVulnerabilities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const analyze = useCallback(async (params: {
    areaSize: number;
    pestType: string;
    infestationLevel: 'Baixo' | 'Médio' | 'Alto' | 'Crítico';
    city?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const adviceResult = await AIService.analyzeQuoteOpportunity(empresaId, params);
      setSuggestion(adviceResult);
      return adviceResult;
    } catch (err: any) {
      const parsedError = err instanceof Error ? err : new Error(String(err));
      setError(parsedError);
      throw parsedError;
    } finally {
      setLoading(false);
    }
  }, [empresaId]);

  const runVulnerabilityAudit = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const auditResult = await AIService.getVulnerabilityAuditSummary(empresaId);
      setVulnerabilities(auditResult);
      return auditResult;
    } catch (err: any) {
      const parsedError = err instanceof Error ? err : new Error(String(err));
      setError(parsedError);
      throw parsedError;
    } finally {
      setLoading(false);
    }
  }, [empresaId]);

  return {
    suggestion,
    vulnerabilities,
    isLoading: loading,
    error,
    analyze,
    runVulnerabilityAudit
  };
}

export default useAIOpportunity;
