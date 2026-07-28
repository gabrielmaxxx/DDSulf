import { describe, test, expect } from 'vitest';
import { useSystemStore } from '../../src/store/systemStore';

describe('Dashboard Metrics & Financial Retornos Verification', () => {
  test('Dashboard correctly metrics executed and return quotes', () => {
    const state = useSystemStore.getState();
    const currentMonth = new Date().toISOString().slice(0, 7);

    const quotes = state.quotes.list;
    const totalCompletedQuotes = quotes.filter(q => q.status === 'executado').length;
    const totalRetornoQuotes = quotes.filter(q => q.status === 'retorno' || q.isRetorno === true).length;
    const monthlyExecutados = quotes.filter(q => q.createdAt?.startsWith(currentMonth) && q.status === 'executado').length;
    const monthlyRetornos = quotes.filter(q => q.createdAt?.startsWith(currentMonth) && (q.status === 'retorno' || q.isRetorno === true)).length;

    expect(totalCompletedQuotes).toBeGreaterThanOrEqual(3);
    expect(totalRetornoQuotes).toBeGreaterThanOrEqual(1);
    expect(monthlyExecutados).toBeGreaterThanOrEqual(3);
    expect(monthlyRetornos).toBeGreaterThanOrEqual(1);

    const returnRateVal = monthlyExecutados > 0 ? (monthlyRetornos / monthlyExecutados) * 100 : 0;
    expect(returnRateVal).toBeCloseTo(33.33, 1);
  });

  test('Expiring contracts and potential renewals reflect correct counts', () => {
    const state = useSystemStore.getState();
    const contracts = state.contracts;

    const expiringContractsCount = contracts.filter(c => {
      if (!c.endDate) return false;
      const diffTime = new Date(c.endDate).getTime() - new Date().getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 && diffDays <= 15;
    }).length;

    const expiredOrExpiringContracts = contracts.filter(c => {
      if (!c.endDate) return false;
      const diffTime = new Date(c.endDate).getTime() - new Date().getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return c.status === 'vencido' || (diffDays > 0 && diffDays <= 30);
    });

    expect(expiringContractsCount).toBeGreaterThanOrEqual(1);
    expect(expiredOrExpiringContracts.length).toBeGreaterThanOrEqual(2);
  });
});
