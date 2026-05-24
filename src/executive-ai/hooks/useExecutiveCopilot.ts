/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect } from 'react';
import { executiveIntelligenceService } from '../services/executiveIntelligenceService';
import { ExecutiveMessage } from '../types';

export function useExecutiveCopilot(tenantId: string = 'tenant_001_poa') {
  const [messages, setMessages] = useState<ExecutiveMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [memoryHistory, setMemoryHistory] = useState<any[]>([]);

  useEffect(() => {
    // Restore persistent conversation history from local storage for offline memory capability
    try {
      const saved = localStorage.getItem(`ddsulf_exec_chat_${tenantId}`);
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        setMessages([
          {
            id: 'system_welcome',
            role: 'assistant',
            content: '### Bem-vindo à Retransmissora de Decisão DDSulf\nComo seu Copiloto de Inteligência Executiva, analiso em tempo real dados operacionais cruzados de POPs, orçamentos, segurança química regulatória e margens de contratos SaaS.\n\nComo posso orientar suas decisões estratégicas hoje?',
            createdAt: Date.now()
          }
        ]);
      }
    } catch {
      // transient failure fallback
    }
  }, [tenantId]);

  const persistMessages = useCallback((updaterMsg: ExecutiveMessage[]) => {
    setMessages(updaterMsg);
    try {
      localStorage.setItem(`ddsulf_exec_chat_${tenantId}`, JSON.stringify(updaterMsg));
    } catch (e) {
      console.warn('Chat persistence failure:', e);
    }
  }, [tenantId]);

  const triggerQuery = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: ExecutiveMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text,
      createdAt: Date.now()
    };

    const nextMessages = [...messages, userMessage];
    persistMessages(nextMessages);
    setLoading(true);

    try {
      const assistantText = await executiveIntelligenceService.queryCopilotStrategicDirector(
        text,
        nextMessages,
        tenantId
      );

      const assistantMessage: ExecutiveMessage = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: assistantText,
        createdAt: Date.now()
      };

      persistMessages([...nextMessages, assistantMessage]);
    } catch (err: any) {
      console.error('Executive Copilot direct query error:', err);
    } finally {
      setLoading(false);
      // reload logs
      setMemoryHistory([...executiveIntelligenceService.getMemoryLogs()]);
    }
  }, [messages, loading, persistMessages, tenantId]);

  const clearSession = useCallback(() => {
    const defaultMsg: ExecutiveMessage[] = [
      {
        id: 'system_welcome',
        role: 'assistant',
        content: '### Sessão de Direção Executiva Reiniciada\nFaça consultas específicas sobre margens de lucro, riscos sanitários da Anvisa ou cenários futuros de contratação.',
        createdAt: Date.now()
      }
    ];
    persistMessages(defaultMsg);
  }, [persistMessages]);

  useEffect(() => {
    setMemoryHistory([...executiveIntelligenceService.getMemoryLogs()]);
  }, []);

  return {
    messages,
    loading,
    triggerQuery,
    clearSession,
    memoryHistory
  };
}
export default useExecutiveCopilot;
