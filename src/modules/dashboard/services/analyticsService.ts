import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import { auth } from '@/firebase/config';
import { 
  Quote, 
  FinancialCost, 
  Revenue, 
  HistoricalInsight 
} from '@/types/database';
import { getTenantCollectionPath } from '@/tenant';

export const analyticsService = {
  async getDashboardData(empresaId: string) {
    if (!empresaId) throw new Error('empresaId é obrigatório para getDashboardData.');
    try {
      const quotesPath = getTenantCollectionPath(empresaId, 'quotes');
      const costsPath = getTenantCollectionPath(empresaId, 'financial_costs');
      const revenuesPath = getTenantCollectionPath(empresaId, 'revenues');

      const [quotesSnap, costsSnap, revenuesSnap] = await Promise.all([
        getDocs(query(collection(db, quotesPath), orderBy('createdAt', 'desc'), limit(50))),
        getDocs(query(collection(db, costsPath), orderBy('createdAt', 'desc'), limit(50))),
        getDocs(query(collection(db, revenuesPath), orderBy('receivedAt', 'desc'), limit(50)))
      ]);

      const quotes = quotesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Quote);
      const costs = costsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as FinancialCost);
      const revenues = revenuesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Revenue);

      return { quotes, costs, revenues };
    } catch (error) {
      console.error("Firestore fetch error:", error);
      return { 
        quotes: [], 
        costs: [], 
        revenues: [] 
      };
    }
  },

  /**
   * Generates real AI-powered insights using the server-side Gemini endpoint
   */
  async fetchAIInsights(
    empresaId: string, 
    summaryData: {
      totalRevenue?: number;
      avgMargin?: number;
      quotesCount?: number;
      approvedQuotesCount?: number;
      executedQuotesCount?: number;
      unpaidCount?: number;
      unpaidTotal?: number;
      lowStockCount?: number;
      criticalStockNames?: string[];
      expiringContractsCount?: number;
      topPest?: string;
      servicesCount?: number;
      fixedCostsTotal?: number;
    },
    quotesSample: any[] = [],
    costsSample: any[] = []
  ): Promise<HistoricalInsight[]> {
    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : undefined;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/ai/dashboard-insights', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          empresaId,
          summary: summaryData,
          quotesSample: quotesSample.slice(0, 10),
          costsSample: costsSample.slice(0, 10)
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Falha ao obter insights por IA`);
      }

      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item: any, idx: number) => ({
          id: item.id || `ai-ins-${idx}`,
          type: item.type || 'info',
          title: item.title || 'Insight Operacional',
          pattern: item.pattern || item.description || '',
          recommendation: item.recommendation || '',
          confidence: Number(item.confidence) || 0.90,
          dataPoints: Number(item.dataPoints) || quotesSample.length || 1,
          metric: item.metric || 'Geral'
        }));
      }
    } catch (err) {
      console.warn("AI Insights API fallback to data analysis:", err);
    }

    // Fallback: Compute real data-driven insights if network/AI is unavailable
    return this.generateInsights(quotesSample, costsSample, []);
  },

  generateInsights(quotes: Quote[], costs: FinancialCost[], revenues: Revenue[]): HistoricalInsight[] {
    const insights: HistoricalInsight[] = [];
    if (!quotes || quotes.length === 0) {
      return insights;
    }

    const avgMargin = quotes.reduce((acc, q) => acc + (q.estimatedMargin || 0), 0) / quotes.length;
    const totalRev = revenues?.reduce((acc, r) => acc + (r.amount || 0), 0) || 0;

    if (avgMargin < 35) {
      insights.push({
        id: 'ins-margin-warn',
        type: 'warning',
        title: 'Margem Operacional em Declínio',
        pattern: `Margem média consolidada em ${avgMargin.toFixed(1)}%, abaixo do patamar de segurança operacional de 35%.`,
        recommendation: 'Revisar custos de insumos e precificação mínima dos serviços no CRM.',
        confidence: 0.88,
        dataPoints: quotes.length,
        metric: 'Margem Líquida'
      });
    } else {
      insights.push({
        id: 'ins-margin-ok',
        type: 'success',
        title: 'Margem Operacional Saudável',
        pattern: `Margem média operacional de ${avgMargin.toFixed(1)}% superando as metas de rentabilidade.`,
        recommendation: 'Manter a alocação de insumos e parâmetros de orçamentos atuais.',
        confidence: 0.93,
        dataPoints: quotes.length,
        metric: 'Margem Líquida'
      });
    }

    const highDisplacementQuotes = quotes.filter(q => (q.displacement || 0) > 40);
    if (highDisplacementQuotes.length > quotes.length * 0.3) {
      insights.push({
        id: 'ins-disp',
        type: 'info',
        title: 'Deslocamentos Distantes Elevados',
        pattern: `${highDisplacementQuotes.length} serviços envolveram deslocamentos superiores a 40km (${((highDisplacementQuotes.length / quotes.length) * 100).toFixed(0)}% do total).`,
        recommendation: 'Agrupar rotas de atendimento por microrregiões para reduzir custos de combustível.',
        confidence: 0.82,
        dataPoints: highDisplacementQuotes.length,
        metric: 'Logística de Campo'
      });
    }

    const pestCounts: Record<string, number> = {};
    quotes.forEach(q => {
      if (q.pestType) {
        pestCounts[q.pestType] = (pestCounts[q.pestType] || 0) + 1;
      }
    });
    
    const sortedPests = Object.entries(pestCounts).sort((a,b) => b[1] - a[1]);
    if (sortedPests.length > 0) {
      const [topPestName, topPestCount] = sortedPests[0];
      insights.push({
        id: 'ins-top-pest',
        type: 'info',
        title: `Alta Demanda de ${topPestName}`,
        pattern: `Serviços voltados a ${topPestName} representam ${topPestCount} atendimentos na carteira atual.`,
        recommendation: `Garantir estoque de segurança dos químicos homologados para ${topPestName}.`,
        confidence: 0.95,
        dataPoints: topPestCount,
        metric: 'Demanda Operacional'
      });
    }

    return insights;
  }
};

