import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from '@/services/firebase';
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
      console.error("Firestore fetch error, using mock data:", error);
      return { 
        quotes: [], 
        costs: [], 
        revenues: [] 
      };
    }
  },

  generateInsights(quotes: Quote[], costs: FinancialCost[], revenues: Revenue[]): HistoricalInsight[] {
    const insights: HistoricalInsight[] = [];

    const avgMargin = quotes.length > 0 
      ? quotes.reduce((acc, q) => acc + q.estimatedMargin, 0) / quotes.length 
      : 0;

    if (avgMargin < 35) {
      insights.push({
        type: 'warning',
        pattern: 'Margem média operacional em declínio.',
        confidence: 0.85,
        dataPoints: quotes.length
      });
    } else {
      insights.push({
        type: 'success',
        pattern: 'Excelente performance de margem líquida.',
        confidence: 0.92,
        dataPoints: quotes.length
      });
    }

    const highDisplacementQuotes = quotes.filter(q => q.displacement > 40);
    if (highDisplacementQuotes.length > quotes.length * 0.3) {
      insights.push({
        type: 'info',
        pattern: 'Alta densidade de serviços em regiões distantes.',
        confidence: 0.78,
        dataPoints: highDisplacementQuotes.length
      });
    }

    const pestCounts: Record<string, number> = {};
    quotes.forEach(q => {
      pestCounts[q.pestType] = (pestCounts[q.pestType] || 0) + 1;
    });
    
    const topPest = Object.entries(pestCounts).sort((a,b) => b[1] - a[1])[0];
    if (topPest) {
      insights.push({
        type: 'info',
        pattern: `Serviços de ${topPest[0]} representam o maior volume.`,
        confidence: 0.95,
        dataPoints: topPest[1]
      });
    }

    return insights;
  }
};
