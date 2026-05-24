/**
 * DDSulf — Unified Telemetry and Analytics Logger
 * Handles custom platform diagnostics, budget tracking events, and user audit trails.
 */

interface AnalyticsEventParams {
  [key: string]: any;
}

/**
 * Log a descriptive operational platform outcome (offline-safe)
 */
export function logOperationalEvent(eventName: string, params?: AnalyticsEventParams): void {
  const payload = {
    eventName,
    timestamp: new Date().toISOString(),
    ...params
  };
  
  // Safe offline console telemetry
  console.log(`[DDSulf Analytics Event Logged]: ${eventName}`, JSON.stringify(payload));
}

/**
 * Utility to flag high-value financial actions
 */
export function logFinancialTx(type: 'expense' | 'receipt', amount: number, category: string): void {
  logOperationalEvent('financial_transaction_registered', {
    type,
    amount,
    category
  });
}

/**
 * Utility to flag chemical dilution calculations
 */
export function logDilutionCalculation(pestType: string, areaSize: number, priceCalculated: number): void {
  logOperationalEvent('chemical_dilution_pricing', {
    pestType,
    areaSize,
    priceCalculated
  });
}
