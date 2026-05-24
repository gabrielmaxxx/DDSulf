import { db, auth } from './config';

export { db, auth };
export * from './config';
export * from './types';
export * from './firestore';
export * from './services';
export * from './analytics';
export * from './providers';
export * from './hooks';
export * from './collections';
export * from './repositories';
export * from './queries';
export * from './listeners';
export * from './transactions';
export * from './batch';
export * from './indexing';
export * from './security';
export * from './offline';
export * from './sync';
export * from './utils/errorHandler';

const FirebaseSDK = {
  db,
  auth
};

export default FirebaseSDK;
