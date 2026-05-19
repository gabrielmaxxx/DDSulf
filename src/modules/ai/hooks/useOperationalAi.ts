import { useState, useCallback, useEffect } from 'react';
import { aiService } from '../services/aiService';
import { analyticsEngine } from '../services/analyticsEngine';
import { AiMessage, OperationalContext } from '../types';

export function useOperationalAi() {
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState<OperationalContext | null>(null);

  useEffect(() => {
    async function loadContext() {
      const data = await analyticsEngine.getOperationalContext();
      setContext(data);
    }
    loadContext();
  }, []);

  const ask = useCallback(async (text: string) => {
    if (!text.trim() || !context) return;

    const userMessage: AiMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await aiService.ask(text, context);
      
      const assistantMessage: AiMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      const errorMessage: AiMessage = {
        role: 'assistant',
        content: `Desculpe, encontrei um erro: ${error.message}`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }, [context]);

  const clearChat = () => setMessages([]);

  return {
    messages,
    loading,
    ask,
    clearChat,
    context
  };
}
