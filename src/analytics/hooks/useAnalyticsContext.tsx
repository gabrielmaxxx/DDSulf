/**
 * Hook & Provider: useAnalyticsContext
 * Contextual provider to bind overall Business Intelligence values across multi-tenant frameworks.
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useOperationalKPIs } from './useOperationalKPIs';
import { useFinancialAnalytics } from './useFinancialAnalytics';
import { useRealtimeMetrics } from './useRealtimeMetrics';
import { useForecasting } from './useForecasting';
import { useDecisionInsights } from './useDecisionInsights';

const AnalyticsContext = createContext<any>(null);

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const kpisState = useOperationalKPIs();
  const financialState = useFinancialAnalytics();
  const realtimeState = useRealtimeMetrics();
  const forecastingState = useForecasting();
  const decisionState = useDecisionInsights();

  const [activeTenantId, setActiveTenantId] = useState<string>('tenant_erechim_premium');

  return (
    <AnalyticsContext.Provider value={{
      ...kpisState,
      ...financialState,
      ...realtimeState,
      ...forecastingState,
      ...decisionState,
      activeTenantId,
      changeTenantContext: (id: string) => setActiveTenantId(id)
    }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalyticsContext() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider');
  }
  return context;
}
