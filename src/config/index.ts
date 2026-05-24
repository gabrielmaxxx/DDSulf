export const CONFIG = {
  env: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV !== 'production',
  
  api: {
    baseUrl: '/api',
    timeout: 15000
  },
  
  firebase: {
    offlinePersistence: true
  },
  
  security: {
    sessionDurationMs: 3600000 * 24 // 24 hours
  }
};
