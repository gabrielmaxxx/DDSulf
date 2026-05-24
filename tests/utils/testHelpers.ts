/**
 * DDSulf QA Testing Utilities & Assert Helpers
 */

export class TestHelpers {
  /**
   * Utility to wait dynamic timeframes
   */
  public static async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Safe comparison matcher of profit margins
   */
  public static assertProfitMargin(price: number, cost: number, expectedMin: number = 35): boolean {
    if (price <= 0) return false;
    const margin = ((price - cost) / price) * 100;
    return margin >= expectedMin;
  }

  /**
   * Asserts safe ecological levels for chemical treatment application
   */
  public static assertEcologicalBoundary(mlVolumeUsed: number, areaM2Used: number, limitMlPerM2: number = 120): boolean {
    if (areaM2Used <= 0) return false;
    const dosage = mlVolumeUsed / areaM2Used;
    return dosage <= limitMlPerM2;
  }
}
