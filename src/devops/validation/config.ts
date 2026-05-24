/**
 * Smoke checks and PWA offline validations endpoints
 */
export const validationConfig = {
  smokeEndpoints: ['/api/health', '/api/dosagem_recomendar', '/api/is_isolated_tenant'],
  pwaPrecacheValidationFiles: ['/index.html', '/assets-manifest.json', '/favicon.ico'],
  requiredFirestoreIndexes: ['geographic_coordinates_composite_key', 'tenant_faturamento_bounds']
};
export default validationConfig;
export { validationConfig as smokeTestConfig };
