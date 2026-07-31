import { BaseFirestoreService } from '../firestore/BaseFirestoreService';
import { UserProfile } from '@/types/database';
import { logOperationalEvent } from '@/firebase/analytics';

export class UsersService extends BaseFirestoreService<UserProfile> {
  constructor() {
    super('users');
  }

  /**
   * Retrieves all active users in the organization
   */
  async getActiveUsers(empresaId: string): Promise<UserProfile[]> {
    return this.list(empresaId, {
      filters: [
        { field: 'status', operator: '==', value: 'active' }
      ]
    });
  }

  /**
   * Safe check to update user profile information (e.g., name, phone, roles)
   */
  async updateProfile(empresaId: string, uid: string, data: Partial<UserProfile>): Promise<void> {
    logOperationalEvent('user_profile_update_requested', { uid, fields: Object.keys(data) });
    await this.update(empresaId, uid, data);
    logOperationalEvent('user_profile_updated', { uid });
  }

  /**
   * Registers a brand new technician profile into the system
   */
  async provisionTechnician(empresaId: string, uid: string, email: string, name: string): Promise<UserProfile> {
    const defaultProfile: UserProfile = {
      uid,
      email,
      name,
      role: 'technician',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await this.create(empresaId, { id: uid, ...defaultProfile });
    logOperationalEvent('technician_profile_provisioned', { uid, email });
    return defaultProfile;
  }
}

export const usersService = new UsersService();
export default usersService;
