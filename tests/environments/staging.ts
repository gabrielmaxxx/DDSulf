/**
 * DDSulf Staging Testing Environment Setup
 */

export const StagingTestEnvironment = {
  envName: 'staging-sandbox',
  apiGatewayUri: 'https://gateway.staging.ddsulf.com.br/v2',
  firebaseProjectId: 'ddsulf-staging-ef911',
  emulateSuitePortals: {
    host: 'localhost',
    firestore: 8080,
    auth: 9099,
    storage: 9199
  },
  perfBudgetsMs: {
    maxFCP: 500,
    maxTTI: 1200,
    maxQueryTime: 50
  },
  testSLAThresholdPercent: 100,
  maxOfflinePersistenceLimitMb: 64
};
