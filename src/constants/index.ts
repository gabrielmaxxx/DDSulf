import { LayoutDashboard, Calculator, Receipt, ClipboardCheck, Package, History, BrainCircuit } from 'lucide-react';

export const APP_METADATA = {
  name: "DDSulf",
  fullName: "DDSulf — Sistema Operacional de Controle de Pragas",
  description: "Plataforma operacional inteligente e analítica para gestão avançada de imunização e controle de pragas",
  email: "contato@ddsulf.com.br",
  version: "1.0.0-foundation"
};

export const ROUTES = {
  dashboard: '/',
  ai: '/ai',
  calculator: '/calculator',
  financial: '/financial',
  pops: '/pops',
  inventory: '/inventory',
  history: '/history',
  login: '/login'
};

export const ROLES = {
  ADMIN: 'admin',
  OPERATOR: 'operator',
  CLIENT: 'client'
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

export const UI_CONSTANTS = {
  sidebarWidth: '280px',
  headerHeight: '64px',
  mobileNavHeight: '80px',
  containerMaxWidth: 'max-w-6xl',
  borderRadius: {
    lg: 'rounded-2xl',
    md: 'rounded-xl',
    sm: 'rounded-lg'
  },
  transitions: {
    default: 'transition-all duration-200 ease-in-out',
    slow: 'transition-all duration-300 ease-out',
    fast: 'transition-all duration-150 ease-out'
  }
};

export const NAVIGATION_ITEMS = [
  { 
    title: 'Dashboard', 
    icon: LayoutDashboard, 
    path: ROUTES.dashboard,
    description: 'Indicadores e performance'
  },
  { 
    title: 'IA Operacional', 
    icon: BrainCircuit, 
    path: ROUTES.ai, 
    highlighted: true,
    description: 'Análises e insights inteligentes'
  },
  { 
    title: 'Calculadora', 
    icon: Calculator, 
    path: ROUTES.calculator,
    description: 'Cálculos de diluição e orçamentos'
  },
  { 
    title: 'Financeiro', 
    icon: Receipt, 
    path: ROUTES.financial,
    description: 'Custo de insumos e faturamento'
  },
  { 
    title: 'POPs Operacionais', 
    icon: ClipboardCheck, 
    path: ROUTES.pops,
    description: 'Procedimentos técnicos em campo'
  },
  { 
    title: 'Estoque', 
    icon: Package, 
    path: ROUTES.inventory,
    description: 'Controle de químicos e EPIs'
  },
  { 
    title: 'Histórico', 
    icon: History, 
    path: ROUTES.history,
    description: 'Registro cronológico'
  },
];
