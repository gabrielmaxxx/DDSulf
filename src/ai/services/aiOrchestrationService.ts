/**
 * PestFlow Advanced AI Orchestration Service
 * Integrates context injection, memory pipelines, provider channels, and strict safety validation.
 */

import { AIChatMessage, SystemCoreContext, AIInsight, AIRecommendation } from '../types';
import { AIContextEngine } from '../context';
import { PromptOrchestrator } from '../prompts';
import { AIMemoryService } from '../memory';
import { AIProviderService } from '../providers';
import { AIInsightEngine } from '../insights';
import { AIRecommendationEngine } from '../recommendations';

export class AIOrchestrationService {
  /**
   * Orchestrates high-level chat reasoning: fetches context, constructs prompts,
   * queries provider, validates response integrity, and appends to memory.
   */
  public static async sendMessage(
    sessionId: string,
    userMessageText: string,
    customContext?: SystemCoreContext
  ): Promise<AIChatMessage[]> {
    // 1. Gather context
    const context = customContext || AIContextEngine.getCachedContext();

    // 2. Save user message to memory
    AIMemoryService.saveMessage(sessionId, { role: 'user', text: userMessageText });

    // 3. Construct prompt incorporating system persona guidelines and restrictions
    const history = AIMemoryService.getSessionHistory(sessionId);
    const orchestratedPrompt = PromptOrchestrator.orchestratePrompt(userMessageText, context);

    try {
      // 4. Submit to provider (this will query backend or use offline local fallbacks)
      const assistantText = await AIProviderService.queryAI(orchestratedPrompt, history);

      // 5. Post-validation: ensure financial masks are still respected
      const sanitizedText = this.validateResponseSafety(assistantText, context);

      // 6. Save model response to memory
      return AIMemoryService.saveMessage(sessionId, { role: 'model', text: sanitizedText });
    } catch (err: any) {
      console.error('[AI Orchestration] Failed to generate response:', err);
      // Fallback response saved in thread
      const errorMsg = `Desculpe, ocorreu uma instabilidade temporária no processamento do modelo analítico. (${err.message || 'Erro de Processamento'})`;
      return AIMemoryService.saveMessage(sessionId, { role: 'model', text: errorMsg });
    }
  }

  /**
   * Live insight parsing wrapper
   */
  public static getLiveInsights(context?: SystemCoreContext): AIInsight[] {
    const activeCtx = context || AIContextEngine.getCachedContext();
    return AIInsightEngine.generateInsights(activeCtx);
  }

  /**
   * Action recommendation compiler
   */
  public static getLiveRecommendations(context?: SystemCoreContext): AIRecommendation[] {
    const activeCtx = context || AIContextEngine.getCachedContext();
    return AIRecommendationEngine.generateRecommendations(activeCtx);
  }

  /**
   * Defensive security check: double checks that lower-level user roles (like technicians or operator profiles)
   * do not receive absolute raw cost integers or sensitive financial calculations, filtering retrospectively if needed.
   */
  private static validateResponseSafety(responseText: string, context: SystemCoreContext): string {
    const r = context.activeRole || 'visualizador';
    if (r === 'tecnico' || r === 'visualizador') {
      // Look for Brazilian Real currency patterns or raw costs that shouldn't leak
      const currencyPattern = /R\$\s?\d+([.,]\d+)?/g;
      if (currencyPattern.test(responseText)) {
        return responseText.replace(
          currencyPattern,
          '**[🔒 Bloqueado por Diretiva de Segurança de Margens]**'
        );
      }
    }
    return responseText;
  }
}

export default AIOrchestrationService;
