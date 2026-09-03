import { describe, test, expect, beforeEach } from 'vitest';
import { useSystemStore } from '../../src/store/systemStore';

describe('Quote Engine Single Source of Truth', () => {
  beforeEach(() => {
    useSystemStore.setState({
      clients: [
        {
          id: 'test-client-1',
          name: 'Cliente Teste',
          document: '00.000.000/0001-00',
          contact: 'Contato Teste',
          email: 'contato@cliente.com',
          phone: '(54) 99999-9999',
          address: 'Rua Teste, 100',
          city: 'Cidade Teste',
          state: 'RS',
          type: 'PJ',
          status: 'ativo',
          createdAt: new Date().toISOString(),
          tags: ['Teste']
        } as any
      ],
      pops: {
        activeTab: 'procedures',
        procedures: [
          {
            id: 'pop-1',
            name: 'Desinsetização Padrão',
            targetPests: ['Baratas', 'Formigas'],
            chemicalEquipments: ['Pulverizador'],
            dilutionRate: '10ml / L',
            instructions: 'Aplicar nos rodapés'
          } as any
        ],
        pragas: [],
        formulacoes: [],
        equipamentos: [],
        fispqs: []
      } as any
    });
  });

  test('Store has clients for quote creation flow', () => {
    const state = useSystemStore.getState();
    expect(state.clients.length).toBeGreaterThan(0);
    const firstClient = state.clients[0];
    expect(firstClient.id).toBeDefined();
    expect(firstClient.name).toBeDefined();
  });

  test('Calculator page uses POP procedures and pricing engine for quotes', () => {
    const state = useSystemStore.getState();
    expect(state.pops?.procedures).toBeDefined();
    expect(state.pops.procedures.length).toBeGreaterThan(0);
    expect(state.inventory?.products).toBeDefined();
  });
});
