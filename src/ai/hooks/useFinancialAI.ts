/**
 * Custom React Hook: useFinancialAI
 * Tracks relative pricing discrepancies, profitability, and enforces financial visibility masks.
 */

import { useContextualInsights } from './useContextualInsights';
import { SystemCoreContext } from '../types';
import { AIContextEngine } from '../context';

export function useFinancialAI(customContext?: SystemCoreContext) {
  const context = customContext || AIContextEngine.getCachedContext();
  const { insights } = useContextualInsights(context);

  const isGuarded_Role = context.activeRole === 'tecnico' || context.activeRole === 'visualizador';

  // Narrow target down to financial category
  const financialInsights = insights.filter(i => i.category === 'financial');

  // Diagnostic checklist indicators
  const marginHealthStatus = isGuarded_Role 
    ? 'Confidencial' 
    : (context.metrics && context.metrics.averageMargin >= 0.30 ? 'Saudável' : 'Requer Atenção');

  return {
    financialInsights,
    marginHealthStatus,
    isFinancialVisibilityMasked: isGuarded_Role,
    costPerHour: isGuarded_Role ? 0 : (context.financialSettings?.costPerHour || 0),
    costPerKm: isGuarded_Role ? 0 : (context.financialSettings?.costPerKm || 0)
  };
}

export default useFinancialAI;
