/**
 * PestFlow Operational AI Provider Wrapper
 * Handles transmission, parsing, and offline fallbacks/ambient heuristics.
 */

import { AIChatMessage, SystemCoreContext } from '../types';
import { AIContextEngine } from '../context';
import { auth } from '@/firebase/config';

export class AIProviderService {
  /**
   * Dispatches user message, syncing active permissions context to the server proxy
   */
  public static async queryAI(
    message: string,
    history: AIChatMessage[] = []
  ): Promise<string> {
    const context = AIContextEngine.getCachedContext();

    // Check connectivity
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return this.generateOfflineHeuristicAnswer(message, context);
    }

    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : undefined;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({ message, context, history }),
      });

      if (!response.ok) {
        throw new Error(`Conexão de IA falhou com status ${response.status}`);
      }

      const data = await response.json();
      return data.text || 'Nenhuma resposta retornada do processamento.';
    } catch (err) {
      console.warn('[AI Provider] Server communication failed, using offline heuristic fallback.', err);
      return this.generateOfflineHeuristicAnswer(message, context);
    }
  }

  /**
   * Local deterministic heuristics to return premium, safe guidance when offline or experiencing network drops.
   */
  private static generateOfflineHeuristicAnswer(prompt: string, context: SystemCoreContext): string {
    const p = prompt.toLowerCase();
    const isTechnical = context.activeRole === 'tecnico' || context.activeRole === 'visualizador';

    // 1. Basic greeting
    if (p.includes('olá') || p.includes('oi') || p.includes('bom dia') || p.includes('boa tarde')) {
      return `Olá, **${context.userName}**! Sou o assistente operacional PestFlow de contingência. No momento, operando em modo **Offline Resiliente**. Como posso ajudar na retaguarda operacional?`;
    }

    // 2. Financial restrictions checks
    if (isTechnical && (p.includes('custo') || p.includes('margem') || p.includes('lucro') || p.includes('preço') || p.includes('faturamento'))) {
      return `### 🔒 Acesso Restrito por Governança\n\nOlá **${context.userName}**, notamos uma consulta de teor financeiro. De acordo com as diretrizes do seu perfil do tipo **${context.activeRole.toUpperCase()}**, os custos unitários e as margens de faturamento comercial do PestFlow são blindadas.\n\n*Para visualizar ou editar custos operacionais de defensivos, faça login com uma conta Admin ou Financeira.*`;
    }

    // 3. Margin explanations
    if (p.includes('margem') || p.includes('calculo') || p.includes('lucro')) {
      const marginVal = context.metrics?.averageMargin || 0.32;
      return `### 📊 Análise de Viabilidade Financeira (Contingência Local)\n\nAtualmente, a taxa média de margem operacional do PestFlow está estimada em **${(marginVal * 100).toFixed(0)}%**.\n\n*   **Meta Operacional**: O padrão do sistema visa manter lucros brutos iguais ou superiores a **30%** em orçamentos comerciais.\n*   **Otimização**: Margens inadequadas são recorrentes por erro de quilometragem de deslocamento calculadas incorretamente de forma manual.\n*   **Instrução**: Verifique a Calculadora de Orçamentos de Campo para detalhar as taxas de depreciação e EPIs incluídas por operador.`;
    }

    // 4. Productivity
    if (p.includes('produtividade') || p.includes('técnico') || p.includes('tecnico') || p.includes('tempo')) {
      return `### ⚡ Heurística de Produtividade de Campo\n\n*   **Taxa de Utilização**: Equipes de controle de vetores obtêm maior eficiência em agendamentos agrupados pela mesma região geopolítica (redução de 32% no uso de combustível).\n*   **Performance**: O tempo de retorno médio estipulado para reforço de baratas ou escorpiões é de 20 minutos por ambiente residencial padrão de até 150m².`;
    }

    // Default response
    return `### 📶 Assistente PestFlow (Heurística Offline)\n\nOlá! Atualmente, você está sem conexão com a internet ou em modo de conexão degradada de campo. \n\nO assistente operacional PestFlow coletou os seguintes dados do seu terminal local:\n*   **Operador**: ${context.userName} (Perfil: ${context.activeRole.toUpperCase()})\n*   **Serviços Ativos em Buffer**: ${context.metrics?.serviceVolume || 0} ordens de serviço.\n*   **Latência de Sincronia**: ${context.metrics?.syncLatencyMs || 0}ms.\n\nTente reconectar a rede móvel externa para habilitar o processamento analítico profundo e completo do modelo de inteligência contextualizada Gemini.`;
  }
}

export default AIProviderService;
