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

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: string[];
}

export interface FavoriteItem {
  id: string;
  title: string;
  query: string;
  mode: 'chat' | 'analista' | 'consultor';
  block?: string;
}

export interface HistoryItem {
  id: string;
  date: string;
  type: 'chat' | 'analista' | 'consultor';
  title: string;
  query: string;
  preview: string;
}

export interface AutomaticInsight {
  id: string;
  badge: string;
  badgeColor: string;
  title: string;
  description: string;
  actionLabel: string;
  path: string;
}

export type AIMainTab = 'chat' | 'copiloto' | 'insights' | 'auditor' | 'consultor';

export type SpreadsheetSubTab =
  | 'premissas'
  | 'folha'
  | 'fixos'
  | 'variaveis'
  | 'emprestimos'
  | 'dre'
  | 'fluxo'
  | 'indicadores';
