/**
 * Deployments specific parameters and configurations
 */
export const deploymentsConfig = {
  gatekeeperEnabled: true,
  maxConcurrentDeploys: 1,
  rolloutProgressionSteps: [10, 30, 50, 100],
  allowForcedSkip: false
};
