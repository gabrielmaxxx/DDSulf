import { Quote, ServiceExecution, Product, StockMovement } from '@/types/database';

export interface AiMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isInsight?: boolean;
}

export interface OperationalContext {
  financialSummary?: {
    totalRevenue: number;
    totalCosts: number;
    profit: number;
    margin: number;
  };
  topProducts?: Product[];
  recentMovements?: StockMovement[];
  serviceMetrics?: {
    totalServices: number;
    averageTicket: number;
    byCategory: Record<string, number>;
  };
}
