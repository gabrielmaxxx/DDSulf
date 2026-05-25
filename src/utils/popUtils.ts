import { POPProcedure } from '../store/systemStore';

/**
 * Searches and returns the most appropriate POP procedure given the pest and service type constraints.
 */
export function getPOPForService(
  pestType: string,
  serviceType: string,
  pops: POPProcedure[]
): POPProcedure | null {
  if (!pops || !Array.isArray(pops)) return null;

  // 1. Safe lookup for exact pest and service match
  const exactMatch = pops.find(
    (p) =>
      p.pestType.toLowerCase().trim() === pestType.toLowerCase().trim() &&
      p.serviceType.toLowerCase().trim() === serviceType.toLowerCase().trim()
  );
  if (exactMatch) return exactMatch;

  // 2. Fallbacks: Match serviceType first, ignoring pestType
  const serviceMatch = pops.find(
    (p) => p.serviceType.toLowerCase().trim() === serviceType.toLowerCase().trim()
  );
  if (serviceMatch) return serviceMatch;

  // 3. Fallbacks: Match pestType first, ignoring serviceType
  const pestMatch = pops.find(
    (p) => p.pestType.toLowerCase().trim() === pestType.toLowerCase().trim()
  );
  if (pestMatch) return pestMatch;

  // 4. Default to first if available, otherwise null
  return pops.length > 0 ? pops[0] : null;
}

/**
 * Scale chemical quantities to apply proportionately based on custom target areas.
 */
export function calculateProductsForArea(
  pop: POPProcedure,
  areaM2: number
): Array<{ productId: string; productName: string; quantity: number; unit: string }> {
  if (!pop || !pop.requiredProducts || !Array.isArray(pop.requiredProducts)) {
    return [];
  }

  // Quantities in the template are designed for a 100m² area reference frame.
  const scaleFactor = areaM2 / 100;

  return pop.requiredProducts.map((p) => ({
    productId: p.productId,
    productName: p.productName,
    quantity: parseFloat((p.quantityPer100m2 * scaleFactor).toFixed(4)),
    unit: p.unit
  }));
}
