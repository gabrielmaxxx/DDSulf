/**
 * Cloud Infrastructure Configuration - Provisioning Tiers
 */
export const infrastructureConfig = {
  provider: 'gcp',
  allowedRegions: ['southamerica-east1', 'us-central1'],
  redundancyTiers: {
    critical: { replicas: 3, failoverSeconds: 5 },
    operational: { replicas: 2, failoverSeconds: 30 },
    monitoring: { replicas: 1, failoverSeconds: 120 }
  }
};
