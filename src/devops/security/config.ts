/**
 * Cryptographic masks and API Keys proxy policies
 */
export const securityPipelineConfig = {
  vulnerabilityValidationLevel: 'high',
  allowUnregisteredIP: false,
  requiredAuditHeaders: ['x-ddsulf-secops-token', 'x-tenant-context-isolation-id'],
  geminiMaskingEnabled: true
};
export default securityPipelineConfig;
