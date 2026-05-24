/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InvoiceDetail } from '../types';

const BILLING_STORAGE_KEY = 'ddsulf_saas_billing_invoices';

export class BillingService {
  private invoices: InvoiceDetail[] = [];

  constructor() {
    this.initializeDefaultInvoices();
  }

  private initializeDefaultInvoices() {
    try {
      const saved = localStorage.getItem(BILLING_STORAGE_KEY);
      if (saved) {
        this.invoices = JSON.parse(saved);
      } else {
        const now = Date.now();
        this.invoices = [
          { id: 'inv_001_matriz', tenantId: 'tenant_matriz_sul', amount: 1899.00, dueDate: now - 3 * 86400000, paidDate: now - 3 * 86400000, status: 'paid', paymentMethod: 'Boleto Bancário' },
          { id: 'inv_002_matriz', tenantId: 'tenant_matriz_sul', amount: 1899.00, dueDate: now + 27 * 86400000, status: 'open', paymentMethod: 'Cartão de Crédito Enterprise' },
          { id: 'inv_001_bio', tenantId: 'tenant_bio_sanear', amount: 649.00, dueDate: now - 2 * 86450000, paidDate: now - 2 * 86450000, status: 'paid', paymentMethod: 'Pix Instantâneo' },
          { id: 'inv_001_agro', tenantId: 'tenant_agro_defensivos', amount: 249.00, dueDate: now - 5 * 86400000, status: 'overdue', paymentMethod: 'Boleto Bancário' },
        ];
        this.persist();
      }
    } catch {
      // Catch empty localstorage error
    }
  }

  private persist() {
    try {
      localStorage.setItem(BILLING_STORAGE_KEY, JSON.stringify(this.invoices));
    } catch (e) {
      console.warn('Billing persistence failure:', e);
    }
  }

  public getInvoices(): InvoiceDetail[] {
    return this.invoices;
  }

  public getInvoicesForTenant(tenantId: string): InvoiceDetail[] {
    return this.invoices.filter(i => i.tenantId === tenantId);
  }

  public collectPayment(invoiceId: string): boolean {
    const inv = this.invoices.find(i => i.id === invoiceId);
    if (!inv || inv.status === 'paid') return false;

    inv.status = 'paid';
    inv.paidDate = Date.now();
    this.persist();
    return true;
  }

  public generateSubscriptionInvoice(tenantId: string, amount: number): InvoiceDetail {
    const newInv: InvoiceDetail = {
      id: `inv_gen_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      tenantId,
      amount,
      dueDate: Date.now() + 10 * 86400000,
      status: 'open',
      paymentMethod: 'Pix'
    };
    this.invoices.unshift(newInv);
    this.persist();
    return newInv;
  }
}

export const billingService = new BillingService();
export default billingService;
