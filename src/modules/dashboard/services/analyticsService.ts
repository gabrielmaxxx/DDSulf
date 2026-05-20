import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  where,
  limit 
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import { 
  Quote, 
  FinancialCost, 
  Revenue, 
  HistoricalInsight,
  DashboardMetric 
} from '@/types/database';

export const analyticsService = {
  async getDashboardData() {
    // In a real scenario, we might use a 云函数 or pre-aggregated metrics
    // For now, we fetch and aggregate on client
    try {
      const [quotesSnap, costsSnap, revenuesSnap] = await Promise.all([
        getDocs(query(collection(db, 'quotes'), orderBy('createdAt', 'desc'), limit(50))),
        getDocs(query(collection(db, 'financial_costs'), orderBy('createdAt', 'desc'), limit(50))),
        getDocs(query(collection(db, 'revenues'), orderBy('receivedAt', 'desc'), limit(50)))
      ]);

      const quotes = quotesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Quote);
      const costs = costsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as FinancialCost);
      const revenues = revenuesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Revenue);

      return { quotes, costs, revenues };
    } catch (error) {
      console.error("Firestore fetch error, using mock data:", error);
      // Return empty arrays or some mock data to avoid infinite loading
      return { 
        quotes: [], 
        costs: [], 
        revenues: [] 
      };
    }
  },

  generateInsights(quotes: Quote[], costs: FinancialCost[], revenues: Revenue[]): HistoricalInsight[] {
    const insights: HistoricalInsight[] = [];

    // 1. Profitability Insight
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

    // 2. High Cost Region Insight
    const highDisplacementQuotes = quotes.filter(q => q.displacement > 40);
    if (highDisplacementQuotes.length > quotes.length * 0.3) {
      insights.push({
        type: 'info',
        pattern: 'Alta densidade de serviços em regiões distantes.',
        confidence: 0.78,
        dataPoints: highDisplacementQuotes.length
      });
    }

    // 3. Pest Type Insight
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
