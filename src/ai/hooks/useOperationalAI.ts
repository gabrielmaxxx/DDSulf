/**
 * Custom React Hook: useOperationalAI
 * Streamlines reactive chat streams, loading flags, thread clears and session memories.
 */

import { useState, useEffect } from 'react';
import { AIChatMessage, SystemCoreContext } from '../types';
import { AIOrchestrationService } from '../services/aiOrchestrationService';
import { AIMemoryService } from '../memory';
import { AIContextEngine } from '../context';

export function useOperationalAI(sessionId: string = 'default_ai_session') {
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fill first state in
    setMessages(AIMemoryService.getSessionHistory(sessionId));
  }, [sessionId]);

  const sendMessage = async (text: string, customContext?: SystemCoreContext) => {
    if (!text.trim()) return;

    setIsGenerating(true);
    setError(null);

    // Optimistically dump the user's message in local state
    const optimisticMessages = AIMemoryService.saveMessage(sessionId, { role: 'user', text });
    setMessages(optimisticMessages);

    try {
      const activeCtx = customContext || AIContextEngine.getCachedContext();
      const updatedHistory = await AIOrchestrationService.sendMessage(sessionId, text, activeCtx);
      setMessages(updatedHistory);
    } catch (err: any) {
      console.error('[useOperationalAI] Failed to transmit message:', err);
      setError(err.message || 'Falha ao processar solicitação de IA.');
    } finally {
      setIsGenerating(false);
    }
  };

  const clearSession = () => {
    AIMemoryService.clearSession(sessionId);
    setMessages([]);
    setError(null);
  };

  return {
    messages,
    isGenerating,
    error,
    sendMessage,
    clearSession,
    hasHistory: messages.length > 0
  };
}

export default useOperationalAI;
