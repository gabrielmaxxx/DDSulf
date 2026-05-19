export type UserRole = 'admin' | 'manager' | 'commercial' | 'technician';

export interface User {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  document?: string;
  createdAt: string;
}

export type QuoteStatus = 'draft' | 'sent' | 'approved' | 'rejected';

export interface QuoteItem {
  id: string;
  serviceId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  cost: number;
}

export interface Quote {
  id: string;
  clientId: string;
  clientName?: string;
  userId: string;
  totalAmount: number;
  totalCost: number;
  margin: number;
  status: QuoteStatus;
  items: QuoteItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  baseCost: number;
}

export interface FinancialCost {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: 'operational' | 'structural';
}

export interface Product {
  id: string;
  name: string;
  unit: string;
  cost: number;
  stockQuantity: number;
}

export interface POP {
  id: string;
  title: string;
  description: string;
  content: string;
  steps: string[];
  ppe: string[];
}
