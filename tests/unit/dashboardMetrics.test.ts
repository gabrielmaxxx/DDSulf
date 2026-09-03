import { describe, test, expect, beforeEach } from 'vitest';
import { useSystemStore } from '../../src/store/systemStore';

describe('Dashboard Metrics & Financial Retornos Verification', () => {
  const currentMonth = new Date().toISOString().slice(0, 7);

  beforeEach(() => {
    useSystemStore.setState({
      quotes: {
        list: [
          { id: 'q1', status: 'executado', createdAt: `${currentMonth}-01T10:00:00Z` } as any,
          { id: 'q2', status: 'executado', createdAt: `${currentMonth}-02T10:00:00Z` } as any,
          { id: 'q3', status: 'executado', createdAt: `${currentMonth}-03T10:00:00Z` } as any,
          { id: 'q4', status: 'retorno', isRetorno: true, createdAt: `${currentMonth}-04T10:00:00Z` } as any,
        ]
      } as any,
      contracts: [
        {
          id: 'c1',
          clientName: 'Cliente 1',
          status: 'ativo',
          endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
        } as any,
        {
          id: 'c2',
          clientName: 'Cliente 2',
          status: 'vencido',
          endDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
        } as any
      ]
    });
  });

  test('Dashboard correctly metrics executed and return quotes', () => {
    const state = useSystemStore.getState();

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
