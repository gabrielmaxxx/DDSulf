import { quotesService } from '../calculator/quotes';
import { productsService } from '../inventory/inventory';
import { popsService } from '../pops/pops';
import { logOperationalEvent } from '@/firebase/analytics';

export interface AISuggestionResponse {
  advice: string;
  recommendedPriceAdjustment: number; // percentage increment suggested
  riskLevel: 'Baixo' | 'Médio' | 'Alto';
  pesticideRecommendations: string[];
}

export class AIService {
  /**
   * Analyzes an upcoming quote proposal constraints and provides calculated corrections
   */
  static async analyzeQuoteOpportunity(params: {
    areaSize: number;
    pestType: string;
    infestationLevel: 'Baixo' | 'Médio' | 'Alto' | 'Crítico';
    city?: string;
  }): Promise<AISuggestionResponse> {
    logOperationalEvent('ai_quote_analysis_requested', { pest: params.pestType, size: params.areaSize });

    // 1. Check if there are active Procedures (POP) available
    const procedures = await popsService.list();
    const matchingPOP = procedures.find(p => p.pestType === params.pestType);

    // 2. Fetch stock status for pesticides
    const warnings = await productsService.getUnderstockAlerts();
    const hasPesticideShortage = warnings.some(w => 
      w.name.toLowerCase().includes(params.pestType.toLowerCase()) || 
      (matchingPOP?.recommendedProducts?.some(p => w.name.toLowerCase().includes(p.toLowerCase())) ?? false)
    );

    // Build intelligent advice blocks
    let advice = `Planejamento recomendado para dedetização de ${params.pestType} em área de ${params.areaSize}m². `;
    let recommendedPriceAdjustment = 0;
    let riskLevel: 'Baixo' | 'Médio' | 'Alto' = 'Baixo';
    const pesticideRecommendations = matchingPOP?.recommendedProducts || ['Pesticida Padrão Organofosforado', 'Gel Inseticida de Precisão'];

    if (params.infestationLevel === 'Crítico' || params.infestationLevel === 'Alto') {
      advice += `Atenção: Nível de infestação ${params.infestationLevel} requer aplicação dupla pré-agendada com intervalo de 14 dias para quebra do ciclo de eclosão de ovos. `;
      recommendedPriceAdjustment += 15;
      riskLevel = 'Alto';
    }

    if (hasPesticideShortage) {
      advice += `ATENÇÃO DE SUPRIMENTOS: O produto recomendado possui estoque baixo do mínimo operacional. Providenciar remessa emergencial. `;
      recommendedPriceAdjustment += 10; // increase pricing to cover premium emergency supply costs
      riskLevel = 'Alto';
    } else {
      advice += `Os níveis de estoque de insumos estão normais para as formulações químicas indicadas. `;
    }

    if (params.areaSize > 1000) {
      advice += `Área de grande escala. Recomenda-se alocar equipe de no mínimo 3 técnicos para assegurar o tempo ótimo de pulverização e conformidade com os regulamentos de EPI.`;
      recommendedPriceAdjustment += 5;
      riskLevel = riskLevel === 'Alto' ? 'Alto' : 'Médio';
    }

    logOperationalEvent('ai_quote_analysis_resolved', { riskLevel, adjustment: recommendedPriceAdjustment });

    return {
      advice,
      recommendedPriceAdjustment,
      riskLevel,
      pesticideRecommendations
    };
  }

  /**
   * Autonomously flags operational vulnerabilities across business sectors
   */
  static async getVulnerabilityAuditSummary(): Promise<string[]> {
    const alerts: string[] = [];
    const minProducts = await productsService.getUnderstockAlerts();
    
    if (minProducts.length > 0) {
      alerts.push(`O estoque operacional está vulnerável. Há ${minProducts.length} produtos químicos operando abaixo do limite mínimo de segurança.`);
    }

    const quotes = await quotesService.list();
    const pendingHighComplexity = quotes.filter(q => 
      q.status === 'Enviado' && 
      q.operationalComplexity === 'Complexo' &&
      q.suggestedPrice > 2500
    );

    if (pendingHighComplexity.length > 0) {
      alerts.push(`Pipeline de alto risco comercial: Temos ${pendingHighComplexity.length} propostas complexas com valor > R$ 2.500 aguardando aprovação. Recomenda-se acompanhamento direto do gerente.`);
    }

    return alerts;
  }
}

export default AIService;
