/**
 * Repository dealing with User Profile schemas and administrative RBAC logic.
 */

import { BaseRepository } from './BaseRepository';
import { UserProfile } from '../types/enterprise';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config';
import { handleFirestoreError } from '../utils/errorHandler';
import { OperationType } from '../types';

export class UserRepository extends BaseRepository<UserProfile> {
  protected readonly collectionName = 'users';

  public static instance = new UserRepository();

  /**
   * Helper to retrieve a single user by email address safely
   */
  public async getByEmail(email: string): Promise<UserProfile | null> {
    try {
      const q = query(collection(db, this.collectionName), where('email', '==', email));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return null;
      }
      const firstDoc = snapshot.docs[0];
      return { id: firstDoc.id, uid: firstDoc.id, ...firstDoc.data() } as unknown as UserProfile;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `${this.collectionName}:byEmail:${email}`);
      return null;
    }
  }
}

export const userRepository = UserRepository.instance;
