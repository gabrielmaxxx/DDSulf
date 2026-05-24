/**
 * Automated incident mitigation loops configuration
 */
export const automationConfig = {
  checkFrequencySeconds: 15,
  escalateLogsToEmail: 'gabriel.max@ddsulf.com.br',
  autoHealDegradedNodes: true,
  maxConsecutiveRestarts: 3
};
export default automationConfig;
export { automationConfig as automaticTriggersSetup };
