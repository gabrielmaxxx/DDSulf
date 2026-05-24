/**
 * Rollback triggers and fault mitigation policies
 */
export const rollbackConfig = {
  autoRollbackRules: {
    latencyBreachMs: 250,
    consecutiveFailsLimit: 5,
    errorQuotaPct: 2.0
  },
  mitigationChannel: '#ops-alerts-ddsulf',
  safeDeployPredecessorOnly: true
};
export default rollbackConfig;
