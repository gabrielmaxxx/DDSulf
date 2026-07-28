/**
 * Test: Unit - Core Calculators & Chemical Recommendations
 * Validates financial profit margins and sanitary ecological thresholds.
 */

import { describe, test, expect } from 'vitest';
import { TestHelpers } from '../utils/testHelpers';
import { estimateDistanceOffline } from '../../src/modules/calculator/CalculatorPage';

describe('Unit Testing - DDSulf Operations Math Engines', () => {
  
  test('Financial Quote Margin Bounds Assurance', () => {
    // Standard job: price R$ 1000, cost R$ 600 -> margin is (1000-600)/1000 = 40% (Should Pass)
    const healthyMargin = TestHelpers.assertProfitMargin(1000, 600, 35);
    expect(healthyMargin).toBe(true);

    // Unhealthy job: price R$ 500, cost R$ 400 -> margin is 20% (Should Fail standard compliance threshold check)
    const dangerousMargin = TestHelpers.assertProfitMargin(500, 400, 35);
    expect(dangerousMargin).toBe(false);
  });

  test('Pest Chemical Dilution Dosage Threshold Checks', () => {
    // 400ml volume used over 5m2 area yields 80ml/m2 (below WHO regulation of 120ml/m2)
    const safeDosage = TestHelpers.assertEcologicalBoundary(400, 5, 120);
    expect(safeDosage).toBe(true);

    // 1000ml volume used over 5m2 area yields 200ml/m2 (violates WHO regulations)
    const dangerousDosage = TestHelpers.assertEcologicalBoundary(1000, 5, 120);
    expect(dangerousDosage).toBe(false);
  });

  test('Offline Distance Estimator - Same City Center (Valença -> Valença)', () => {
    const hq = 'Rua dos Expedicionários, 100 - Centro, Valença - RJ';
    const client = 'Praça Visconde de Rio Preto, 45 - Centro, Valença - RJ';
    const dist = estimateDistanceOffline(hq, client);
    expect(dist).toBeLessThan(5);
  });

  test('Offline Distance Estimator - Neighboring Cities (Volta Redonda -> Barra Mansa)', () => {
    const hq = 'Rua 33, Vila Santa Cecília, Volta Redonda - RJ';
    const client = 'Avenida Joaquim Leite, Centro, Barra Mansa - RJ';
    const dist = estimateDistanceOffline(hq, client);
    expect(dist).toBeGreaterThanOrEqual(12);
    expect(dist).toBeLessThanOrEqual(16);
  });

  test('Offline Distance Estimator - Intercity Route (Valença <-> Volta Redonda)', () => {
    const hqValenca = 'Rua do Comércio, Valença - RJ';
    const clientVR = 'Rua 33, Volta Redonda - RJ';
    const dist1 = estimateDistanceOffline(hqValenca, clientVR);
    expect(dist1).toBeGreaterThanOrEqual(55);
    expect(dist1).toBeLessThanOrEqual(62);

    const dist2 = estimateDistanceOffline(clientVR, hqValenca);
    expect(dist2).toBeGreaterThanOrEqual(55);
    expect(dist2).toBeLessThanOrEqual(62);
  });

});
