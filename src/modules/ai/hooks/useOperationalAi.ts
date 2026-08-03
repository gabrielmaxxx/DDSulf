import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/auth/hooks/useAuth';
import { analyticsEngine } from '../services/analyticsEngine';
import { AiMessage, OperationalContext } from '../types';
import { AIContextEngine, AIOrchestrationService, AIMemoryService } from '@/ai';

export function useOperationalAi() {
  const { user, role, empresaId } = useAuth();
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState<OperationalContext | null>(null);

  // Load chat history from the memory pipeline on startup
  useEffect(() => {
    const history = AIMemoryService.getSessionHistory('default_ai_session');
    if (history && history.length > 0) {
      setMessages(
        history.map(h => ({
          role: h.role === 'model' ? 'assistant' : 'user',
          content: h.text,
          timestamp: new Date(h.timestamp).toISOString()
        }))
      );
    }
  }, []);

  useEffect(() => {
    async function loadContext() {
      if (!empresaId) return;
      const data = await analyticsEngine.getOperationalContext(empresaId);
      setContext(data);

      // Compile and caching into the unified enterprise context engine
      const userRole = role || 'visualizador';
      const userNameStr = user?.name || user?.email || 'Operador DDSulf';

      AIContextEngine.compileContext(
        userRole,
        userNameStr,
        // Fallback or active settings values
        {
          costPerHour: 45,
          costPerKm: 1.85,
          minimumMargin: 0.30,
          baseOperationalCost: 150
        },
        {
          totalRevenue: data.financialSummary?.totalRevenue || 0,
          totalCosts: data.financialSummary?.totalCosts || 0,
          averageMargin: data.financialSummary?.margin ? (data.financialSummary.margin / 100) : 0,
          serviceVolume: data.serviceMetrics?.totalServices || 0,
          syncLatencyMs: 120, // default latency
          stalledDraftsCount: 3
        }
      );
    }
    loadContext();
  }, [user, role, empresaId]);

  const ask = useCallback(async (text: string) => {
    if (!text.trim() || !context) return;

    // Insert user's optimistic message instantly
    const userMessage: AiMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const sessionId = 'default_ai_session';
      const systemCtx = AIContextEngine.getCachedContext();

      // Dispatch through the high-performance orchestration layer (which checks roles & restricts costs/margins)
      const updatedHistory = await AIOrchestrationService.sendMessage(sessionId, text, systemCtx);

      // Map dynamic history output back to component types
      const mappedHistory = updatedHistory.map(h => ({
        role: h.role === 'model' ? 'assistant' as const : 'user' as const,
        content: h.text,
        timestamp: new Date(h.timestamp).toISOString()
      }));

      setMessages(mappedHistory);
    } catch (error: any) {
      const errorMessage: AiMessage = {
        role: 'assistant',
        content: `Falha na sincronização operacional de inteligência: ${error.message || 'Instabilidade do provedor.'}`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }, [context]);

  const clearChat = () => {
    AIMemoryService.clearSession('default_ai_session');
    setMessages([]);
  };

  return {
    messages,
    loading,
    ask,
    clearChat,
    context
  };
}
