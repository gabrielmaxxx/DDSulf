/**
 * Pipeline: Validation and linting metrics checklist
 */
export const validationPipelineConfig = {
  name: 'Integrity & Multi-Tenant Isolation Checks',
  commands: [
    'npm run lint',
    'npm audit --audit-level=high'
  ],
  strictOnWarnings: false,
  rulesToEnforce: [
    'top-level-imports',
    'enum-usage-without-import-type'
  ]
};
