import { describe, test, expect } from 'vitest';
import {
  computeRoutesForDate,
  calcularDREPorOS,
  type SystemState,
  type AgendaEvent,
  type Quote,
} from '../../src/store/systemStore';

/**
 * Testes de diluição de frete por rota multi-parada.
 *
 * Cenário principal: 3 serviços agendados no mesmo dia, na mesma cidade
 * (Barra Mansa), devem ser agrupados numa única AgendaRoute e ratear o
 * custo de transporte entre si. Um 4º serviço, sozinho em outra cidade
 * no mesmo dia, NÃO deve entrar em nenhuma rota e deve manter seu custo
 * de transporte individual (orçado) intacto.
 */

const TEST_DATE = '2026-08-10';
const COST_PER_KM = 2.4;

function buildBaseState(overrides: Partial<SystemState> = {}): SystemState {
  return {
    financial: {
      fixedCosts: {
        vehicleRental: 0,
        salaries: 0,
        rent: 0,
        fuel: 0,
        insurance: 0,
        other: 0,
      },
      variableCosts: {
        productsPerService: 0,
        laborPerHour: 0,
        equipmentDepreciation: 0,
      },
      operational: { servicesPerMonth: 1 },
      revenueHistory: [],
      movements: [],
    } as any,
    inventory: { products: [], movements: [] } as any,
    pops: { procedures: [] } as any,
    quotes: { list: [] },
    settings: {
      companyName: 'Teste',
      cnpj: '',
      headquartersAddress: 'Volta Redonda, RJ',
      city: 'Volta Redonda',
      state: 'RJ',
      phone: '',
      operationalGoals: {
        targetServicesPerMonth: 100,
        minimumMarginPercent: 20,
        costPerKm: COST_PER_KM,
      },
    },
    clients: [],
    contracts: [],
    agenda: [],
    purchases: [],
    employees: [],
    routes: [],
    companies: {},
    currentCompany: null,
    ...overrides,
  } as SystemState;
}

function makeQuote(id: string, address: string, transport: number): Quote {
  return {
    id,
    createdAt: `${TEST_DATE}T08:00:00.000Z`,
    status: 'aprovado',
    client: { name: `Cliente ${id}`, address },
    service: { pestType: 'baratas', serviceType: 'dedetizacao', areaM2: 100, distanceKm: 20 },
    costs: { products: 80, labor: 120, transport, overhead: 30, total: 80 + 120 + transport + 30 },
    pricing: { suggestedPrice: 500, finalPrice: 500, marginPercent: 34 },
    productsUsed: [],
    inventoryDeducted: false,
  };
}

function makeEvent(id: string, quoteId: string, clientName: string): AgendaEvent {
  return {
    id,
    title: `OS - ${clientName}`,
    date: TEST_DATE,
    time: '08:00',
    clientName,
    type: 'servico',
    quoteId,
    status: 'pendente',
  };
}

describe('Diluição de frete por rota multi-parada', () => {
  test('agrupa 3 serviços da mesma cidade no mesmo dia em uma única rota', () => {
    const quotes: Quote[] = [
      makeQuote('q1', 'Rua A, 100 - Centro, Barra Mansa - RJ', 60),
      makeQuote('q2', 'Rua B, 200 - Centro, Barra Mansa - RJ', 60),
      makeQuote('q3', 'Rua C, 300 - Centro, Barra Mansa - RJ', 60),
    ];
    const events: AgendaEvent[] = [
      makeEvent('ev1', 'q1', 'Cliente q1'),
      makeEvent('ev2', 'q2', 'Cliente q2'),
      makeEvent('ev3', 'q3', 'Cliente q3'),
    ];

    const state = buildBaseState({
      quotes: { list: quotes },
      agenda: events,
    });

    const routes = computeRoutesForDate(TEST_DATE, state);

    expect(routes.length).toBe(1);
    const route = routes[0];
    expect(route.stopEventIds.sort()).toEqual(['ev1', 'ev2', 'ev3']);
    expect(route.totalDistanceKm).toBeGreaterThan(0);
    expect(route.totalTransportCost).toBeCloseTo(route.totalDistanceKm * COST_PER_KM, 2);

    // Rateio igual entre as 3 paradas
    const perStopValues = route.stopEventIds.map(id => route.costPerStop[id]);
    expect(perStopValues.every(v => Math.abs(v - perStopValues[0]) < 0.01)).toBe(true);
    expect(perStopValues[0]).toBeCloseTo(route.totalTransportCost / 3, 2);
  });

  test('serviço isolado em outra cidade não entra em nenhuma rota', () => {
    const quotes: Quote[] = [
      makeQuote('q1', 'Rua A, 100 - Centro, Barra Mansa - RJ', 60),
      makeQuote('q2', 'Rua B, 200 - Centro, Barra Mansa - RJ', 60),
      makeQuote('q4', 'Rua Z, 999 - Centro, Valença - RJ', 90),
    ];
    const events: AgendaEvent[] = [
      makeEvent('ev1', 'q1', 'Cliente q1'),
      makeEvent('ev2', 'q2', 'Cliente q2'),
      makeEvent('ev4', 'q4', 'Cliente q4'),
    ];

    const state = buildBaseState({
      quotes: { list: quotes },
      agenda: events,
    });

    const routes = computeRoutesForDate(TEST_DATE, state);

    // Só a dupla de Barra Mansa forma rota; Valença fica sozinho, sem rota
    expect(routes.length).toBe(1);
    expect(routes[0].stopEventIds).not.toContain('ev4');
  });

  test('DRE usa o custo diluído da rota para calcular margem, sem alterar o preço do orçamento', () => {
    const quotes: Quote[] = [
      makeQuote('q1', 'Rua A, 100 - Centro, Barra Mansa - RJ', 60),
      makeQuote('q2', 'Rua B, 200 - Centro, Barra Mansa - RJ', 60),
      makeQuote('q3', 'Rua C, 300 - Centro, Barra Mansa - RJ', 60),
    ];
    const events: AgendaEvent[] = [
      makeEvent('ev1', 'q1', 'Cliente q1'),
      makeEvent('ev2', 'q2', 'Cliente q2'),
      makeEvent('ev3', 'q3', 'Cliente q3'),
    ];

    let state = buildBaseState({
      quotes: { list: quotes },
      agenda: events,
    });

    const routes = computeRoutesForDate(TEST_DATE, state);
    state = { ...state, routes };

    const targetQuote = quotes[0];
    const breakdown = calcularDREPorOS(targetQuote, state);

    const dilutedTransport = routes[0].costPerStop['ev1'];
    const expectedVariableCost = targetQuote.costs.total - targetQuote.costs.transport + dilutedTransport;

    expect(breakdown.variableCost).toBeCloseTo(expectedVariableCost, 2);
    expect(breakdown.transportSavings).toBeCloseTo(targetQuote.costs.transport - dilutedTransport, 2);

    // Preço ao cliente permanece intocado
    expect(targetQuote.pricing.finalPrice).toBe(500);
  });

  test('sem rota associada, DRE usa o custo de transporte individual normalmente', () => {
    const quote = makeQuote('q-solo', 'Rua Z, 999 - Centro, Valença - RJ', 90);
    const event = makeEvent('ev-solo', 'q-solo', 'Cliente Solo');

    const state = buildBaseState({
      quotes: { list: [quote] },
      agenda: [event],
      routes: [],
    });

    const breakdown = calcularDREPorOS(quote, state);

    expect(breakdown.transportSavings).toBeUndefined();
    expect(breakdown.variableCost).toBeCloseTo(quote.costs.total, 2);
  });
});
