/**
 * Pipeline: Deployment and progressive canary weights configuration
 */
export const deploymentPipelineConfig = {
  name: 'Multi-Environment Edge Rollout',
  environments: ['development', 'staging', 'production'],
  canaryStrategy: {
    enabled: true,
    initialPct: 10,
    incrementPct: 20,
    soakDurationMs: 600000 // 10 minutes
  },
  tenantIsolationLevel: 'isolated'
};
export default deploymentPipelineConfig;
