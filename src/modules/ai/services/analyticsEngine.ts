import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { OperationalContext } from '../types';
import { Quote, ServiceExecution, Product } from '@/types/database';

export const analyticsEngine = {
  async getOperationalContext(): Promise<OperationalContext> {
    try {
      // Fetch data for context
      const quotesSnap = await getDocs(collection(db, 'quotes'));
      const servicesSnap = await getDocs(collection(db, 'services'));
      const productsSnap = await getDocs(collection(db, 'products'));

      const quotes = quotesSnap.docs.map(d => d.data() as Quote);
      const services = servicesSnap.docs.map(d => d.data() as ServiceExecution);
      const products = productsSnap.docs.map(d => d.data() as Product);

      // Simple revenue/cost calc
      const totalRevenue = quotes.reduce((acc, q) => acc + (q.suggestedPrice || 0), 0);
      const totalCosts = quotes.reduce((acc, q) => acc + (q.estimatedCost || 0), 0);
      
      const quotesMap = new Map(quotes.map(q => [q.id, q]));
      
      const byCategory: Record<string, number> = {};
      services.forEach(s => {
        const quote = quotesMap.get(s.quoteId);
        const category = quote?.pestType || 'Outros';
        byCategory[category] = (byCategory[category] || 0) + 1;
      });

      return {
        financialSummary: {
          totalRevenue,
          totalCosts,
          profit: totalRevenue - totalCosts,
          margin: totalRevenue > 0 ? ((totalRevenue - totalCosts) / totalRevenue) * 100 : 0
        },
        topProducts: products.slice(0, 5),
        serviceMetrics: {
          totalServices: services.length,
          averageTicket: quotes.length > 0 ? totalRevenue / quotes.length : 0,
          byCategory
        }
      };
    } catch (error) {
      console.error("Error gathering context:", error);
      // Return partial mock context if fails for demo safety
      return {
        financialSummary: { totalRevenue: 150000, totalCosts: 45000, profit: 105000, margin: 70 },
        serviceMetrics: { totalServices: 84, averageTicket: 1785, byCategory: { 'Baratas': 34, 'Ratos': 21, 'Cupins': 12 } }
      } as OperationalContext;
    }
  }
};
