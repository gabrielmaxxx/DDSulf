import { DetailedOperationalCost, CompositePrice, PricingSessionDraft } from '../types';

interface CacheEntry {
  key: string;
  costing: DetailedOperationalCost;
  pricing: CompositePrice;
  timestamp: number;
}

const MEMORY_CACHE = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60000; // 1-minute memory cache validation window

/**
 * Creates a unique lookup key from service descriptors to avoid recalculating heavy items
 */
export function buildPricingCacheKey(inputs: {
  areaSize: number;
  displacement: number;
  technicians: number;
  pestType: string;
  environmentType: string;
  infestationLevel: string;
  complexity: string;
  recurrence: string;
  customMargin?: number;
  selectedProductsLength: number;
}): string {
  return [
    inputs.pestType,
    inputs.environmentType,
    inputs.infestationLevel,
    inputs.complexity,
    inputs.recurrence,
    inputs.areaSize,
    inputs.displacement,
    inputs.technicians,
    inputs.customMargin ?? 'null',
    inputs.selectedProductsLength
  ].join('|');
}

/**
 * Checks and retrieves cached financial reports
 */
export function getCachedPricingResult(key: string): { costing: DetailedOperationalCost; pricing: CompositePrice } | null {
  const entry = MEMORY_CACHE.get(key);
  if (!entry) return null;

  // Verify TTL freshness
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    MEMORY_CACHE.delete(key);
    return null;
  }

  return {
    costing: entry.costing,
    pricing: entry.pricing
  };
}

/**
 * Saves pricing computations inside the fast memory map
 */
export function cachePricingResult(key: string, costing: DetailedOperationalCost, pricing: CompositePrice): void {
  // Enforce memory size bounds to avoid leaks
  if (MEMORY_CACHE.size > 100) {
    const oldestKey = MEMORY_CACHE.keys().next().value;
    if (oldestKey) MEMORY_CACHE.delete(oldestKey);
  }

  MEMORY_CACHE.set(key, {
    key,
    costing,
    pricing,
    timestamp: Date.now()
  });
}

/**
 * Saves draft worksheets to localstorage for instant offline recovery
 */
export function persistLocalOfflineDraft(draft: PricingSessionDraft): void {
  try {
    const key = `ddsulf_pricing_draft_${draft.id || 'default'}`;
    localStorage.setItem(key, JSON.stringify(draft));
  } catch (err) {
    console.warn("Pricing draft local persistence error:", err);
  }
}

/**
 * Loads cached drafts during boot sequences
 */
export function recoverLocalOfflineDraft(id: string = 'default'): PricingSessionDraft | null {
  try {
    const key = `ddsulf_pricing_draft_${id}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as PricingSessionDraft;
  } catch (err) {
    console.error("Failed to recover local pricing draft:", err);
    return null;
  }
}
