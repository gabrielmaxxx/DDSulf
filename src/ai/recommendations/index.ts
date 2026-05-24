/**
 * DDSulf AI Recommendation Engine
 * Generates highly contextual operational tips and financial restructuring plans.
 */

import { AIRecommendation, SystemCoreContext } from '../types';

export class AIRecommendationEngine {
  /**
   * Evaluates active system context parameters to suggest concrete enterprise actions.
   */
  public static generateRecommendations(context: SystemCoreContext): AIRecommendation[] {
    const list: AIRecommendation[] = [];
    const r = context.activeRole || 'visualizador';
    const isTechnical = r === 'tecnico' || r === 'visualizador';

    // 1. RECOMMENDATION: Adjust route parameters (Fuel saving)
    if (context.metrics && context.metrics.serviceVolume > 5) {
      list.push({
        id: 'rec_routing_group',
        category: 'operations',
        title: 'Roteamento Inteligente de Vistoria',
        description: 'Agrupar as próximas 6 ordens de serviço por quadrantes geográficos de maior densidade de chamados para esta semana.',
        impactEstimate: 'Economia de ~15% combustível',
        rationalization: 'Reduz o trajeto ocioso de deslocamentos de técnicos entre regiões distantes do município, reduzindo desgaste de frotas.',
        dismissed: false,
        score: 85
      });
    }

    // 2. RECOMMENDATION: Base price correction (Only for authorized roles)
    if (!isTechnical && context.metrics && context.metrics.averageMargin < 0.30) {
      list.push({
        id: 'rec_price_hike',
        category: 'financial',
        title: 'Reestruturação de Base Tarifada',
        description: 'Alterar o valor mínimo de custo por km repassado globalmente nas planilhas de orçamentos de R$1.50 para R$1.85 devido à oscilação de insumos químicos.',
        impactEstimate: '+R$ 1.450 / faturamento mensal',
        rationalization: 'Minimiza a corrosão calada da margem líquida em rotas suburbanas de maior tráfego rodoviário.',
        dismissed: false,
        score: 95
      });
    }

    // 3. RECOMMENDATION: Stagnant quotation auto-followups (Workflow)
    if (context.metrics && context.metrics.stalledDraftsCount && context.metrics.stalledDraftsCount > 2) {
      list.push({
        id: 'rec_workflow_followup',
        category: 'workflow',
        title: 'Auto-Notificação de Orçamentos Ociosos',
        description: 'Habilitar o envio automático do checklist de conformidade sanitária para os contatos das propostas paralisadas em rascunho.',
        impactEstimate: 'Recuperação estimada de 18% em leads',
        rationalization: 'Interações imediatas preventivas resgatam orçamentos que foram esquecidos pelos clientes corporativos.',
        dismissed: false,
        score: 80
      });
    }

    // 4. RECOMMENDATION: Recurrent preventative treatments (Upsell opportunity)
    if (context.targetQuote && !isTechnical) {
      const q = context.targetQuote;
      if (q.pestType === 'Baratas' || q.pestType === 'Ratos') {
        list.push({
          id: 'rec_upsell_recurrence',
          category: 'financial',
          title: 'Transição Comercial para Contratos Recorrentes',
          description: `Oferecer o plano de controle de ${q.pestType} em modelo semestral, oferecendo 10% de abatimento no preço das visitas subsequentes.`,
          impactEstimate: 'Aumento do LTV corporativo em ~40%',
          rationalization: `Infestações de ${q.pestType} demandam tratamento ambiental recorrente sistêmico devido à eclosão reprodutiva de ovos (ootecas).`,
          dismissed: false,
          score: 75
        });
      }
    }

    return list.sort((a, b) => b.score - a.score);
  }
}

export default AIRecommendationEngine;
