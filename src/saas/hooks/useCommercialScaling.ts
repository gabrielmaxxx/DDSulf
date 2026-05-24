/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { saasAnalyticsService } from '../services/saasAnalyticsService';
import { billingService } from '../services/billingService';
import { CommercialMetricSnapshot, InvoiceDetail } from '../types';

export function useCommercialScaling(tenantId?: string) {
  const [analytics, setAnalytics] = useState<CommercialMetricSnapshot>({
    mrrAmount: 0,
    activeTenantsCount: 0,
    trialConversionRate: 0,
    churnRatePercent: 0,
    avgLtvMs: 0
  });

  const [invoices, setInvoices] = useState<InvoiceDetail[]>([]);

  const loadData = useCallback(() => {
    const stats = saasAnalyticsService.compileCommercialAnalytics();
    setAnalytics(stats);

    if (tenantId) {
      setInvoices(billingService.getInvoicesForTenant(tenantId));
    } else {
      setInvoices(billingService.getInvoices());
    }
  }, [tenantId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const collectPendingInvoice = useCallback((invoiceId: string) => {
    const success = billingService.collectPayment(invoiceId);
    if (success) {
      loadData();
    }
    return success;
  }, [loadData]);

  return {
    analytics,
    invoices,
    collectPendingInvoice,
    recalculateScaling: loadData
  };
}
