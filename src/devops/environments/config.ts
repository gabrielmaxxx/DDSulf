/**
 * Multi-environment parameters and connection isolated URLs
 */
export const environmentsConfig = {
  development: {
    apiUrl: 'http://localhost:3000/api',
    firestoreWorkspaceId: 'ddsulf_matriz_dev',
    authDomain: 'dev-auth.ddsulf.com.br',
    debugEnabled: true
  },
  staging: {
    apiUrl: 'https://staging-api.ddsulf.systems',
    firestoreWorkspaceId: 'ddsulf_matriz_staging',
    authDomain: 'staging-auth.ddsulf.com.br',
    debugEnabled: true
  },
  production: {
    apiUrl: 'https://api.ddsulf.com.br',
    firestoreWorkspaceId: 'ddsulf_matriz',
    authDomain: 'auth.ddsulf.com.br',
    debugEnabled: false
  }
};
export default environmentsConfig;
