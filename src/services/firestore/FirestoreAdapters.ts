import { Timestamp } from 'firebase/firestore';

export class FirestoreAdapters {
  /**
   * Safe check and converter for Firebase Timestamp representations back to standard ISO-8601 strings
   */
  static dateToISOString(timestamp: any): string {
    if (!timestamp) return new Date().toISOString();
    
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate().toISOString();
    }
    
    if (typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toISOString();
    }

    if (timestamp.seconds !== undefined) {
      return new Date(timestamp.seconds * 1000).toISOString();
    }

    if (typeof timestamp === 'string') {
      return timestamp;
    }

    if (timestamp instanceof Date) {
      return timestamp.toISOString();
    }

    return new Date().toISOString();
  }

  /**
   * Entity normalization converter to inject consistent default attributes across all data read operations
   */
  static normalizeEntity<T>(snapshotData: any, id: string): T {
    if (!snapshotData) return null as any;

    const data = { ...snapshotData };
    
    // Auto map timestamps back to strings
    if (data.createdAt) data.createdAt = this.dateToISOString(data.createdAt);
    if (data.updatedAt) data.updatedAt = this.dateToISOString(data.updatedAt);
    if (data.receivedAt) data.receivedAt = this.dateToISOString(data.receivedAt);
    if (data.lastLogin) data.lastLogin = this.dateToISOString(data.lastLogin);
    if (data.executionDate) data.executionDate = this.dateToISOString(data.executionDate);

    return {
      id,
      ...data
    } as T;
  }
}

export default FirestoreAdapters;
