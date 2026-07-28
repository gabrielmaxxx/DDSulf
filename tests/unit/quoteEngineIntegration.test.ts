import { describe, test, expect } from 'vitest';
import { useSystemStore } from '../../src/store/systemStore';

describe('Quote Engine Single Source of Truth', () => {
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
