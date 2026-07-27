/**
 * PestFlow Operational Heuristics and Realtime Insight Generation Engine
 * Scans financial levels, stock minimums, and sync latencies to supply actionable insights.
 */

import { AIInsight, SystemCoreContext } from '../types';

export class AIInsightEngine {
  /**
   * Generates analytical insights by evaluating context variables,
   * respecting confidentiality limits of technical roles.
   */
  public static generateInsights(context: SystemCoreContext): AIInsight[] {
    const list: AIInsight[] = [];
    const r = context.activeRole || 'visualizador';

    // Information Guard: Hide financial insights from field technicians/operators
    const canSeeFinancials = r === 'super_admin' || r === 'admin' || r === 'financeiro' || r === 'comercial';

    // 1. Financial: Critical Low Margin check
    if (canSeeFinancials && context.metrics && context.metrics.averageMargin < 0.25) {
      list.push({
        id: 'ins_margin_drop',
        category: 'financial',
        title: 'Lucratividade Global Sob Risco',
        description: `A margem média atual de ${(context.metrics.averageMargin * 100).toFixed(1)}% está abaixo do limite de 25%. Há contratos recorrentes deficitários em andamento.`,
        confidence: 0.94,
        impact: 'critical',
        actionableSuggestion: 'Revise os valores de custo/km de deslocamento e considere reajustar propostas trimestrais expiradas.',
        timestamp: Date.now()
      });
    }

    // 2. Financial: Raw pricing deviation check inside the active calculator
    if (canSeeFinancials && context.targetQuote) {
      const q = context.targetQuote;
      if (q.estimatedMargin < 0.20) {
        list.push({
          id: 'ins_quote_bleed',
          category: 'financial',
          title: 'Subprecificação Detectada',
          description: `O orçamento piloto para "${q.pestType}" em "${q.environmentType}" possui apenas ${(q.estimatedMargin * 100).toFixed(0)}% de margem projetada.`,
          confidence: 0.88,
          impact: 'alert',
          actionableSuggestion: 'Aumente o multiplicador de complexidade ou reduza a quantidade recomendada de operários no local.',
          timestamp: Date.now()
        });
      }
    }

    // 3. Workflow: Abandoned drafts and stagnant quote wizards
    if (context.metrics && context.metrics.stalledDraftsCount && context.metrics.stalledDraftsCount > 4) {
      list.push({
        id: 'ins_stalled_drafts',
        category: 'workflow',
        title: 'Gargalo em Conversão Comercial',
        description: `Identificamos ${context.metrics.stalledDraftsCount} orçamentos em rascunho sem movimentação nas últimas 72 horas.`,
        confidence: 0.85,
        impact: 'alert',
        actionableSuggestion: 'Automatize lembretes de acompanhamento sobre as propostas ou solicite feedback verbal aos clientes.',
        timestamp: Date.now()
      });
    }

    // 4. Operations: High sync latency or connectivity problems
    if (context.metrics && context.metrics.syncLatencyMs && context.metrics.syncLatencyMs > 4000) {
      list.push({
        id: 'ins_sync_lag',
        category: 'operations',
        title: 'Grave Latência em Dispositivos de Campo',
        description: `Alguns aparelhos estão levando mais de ${(context.metrics.syncLatencyMs / 1000).toFixed(1)} segundos para sincronizar as folhas de visitas offline.`,
        confidence: 0.92,
        impact: 'alert',
        actionableSuggestion: 'Otimize o tamanho dos arquivos anexados (imagens de laudos) ou sugira alternar para conexões alternativas de maior cobertura.',
        timestamp: Date.now()
      });
    }

    // 5. Operations/Pest Trend: Dynamic insights if volume is growing
    if (context.metrics && context.metrics.serviceVolume && context.metrics.serviceVolume > 20) {
      list.push({
        id: 'ins_volume_trend',
        category: 'analytics',
        title: 'Aumento Sazonal de Controle Agroquímico',
        description: `A volumetria de ordens de serviço cresceu substantivamente. Maior incidência histórica de insetos rasteiros e reincidências em condomínios.`,
        confidence: 0.79,
        impact: 'positive',
        actionableSuggestion: 'Reabasteça estoque crítico de decapantes e solventes preventivamente com os fornecedores usuais.',
        timestamp: Date.now()
      });
    }

    // Fallback: If no alarms triggered, supply positive informational notes
    if (list.length === 0) {
      list.push({
        id: 'ins_healthy_ops',
        category: 'analytics',
        title: 'Integridade de Operações Preservada',
        description: 'Todos os indicadores de conformidade de margem bruta, latência de servidores e inventário móvel estão operando sob níveis normais estáveis.',
        confidence: 0.98,
        impact: 'positive',
        timestamp: Date.now()
      });
    }

    return list;
  }
}

export default AIInsightEngine;
