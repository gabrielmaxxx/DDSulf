import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/firebase/config';
import { UserProfile, UserRole } from '@/types/database';
import { logOperationalEvent } from '@/firebase/analytics';
import { handleFirestoreError } from '@/firebase/utils/errorHandler';
import { OperationType } from '@/firebase/types';

export const googleProvider = new GoogleAuthProvider();

/**
 * Enterprise Auth Service
 */
export class AuthService {
  /**
   * Complete Google Identity SSP login pipeline
   */
  static async loginWithGoogle(): Promise<UserProfile> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      
      const profile = await this.syncUserProfile(firebaseUser);
      logOperationalEvent('auth_login_google_success', { uid: profile.uid, role: profile.role });
      return profile;
    } catch (error: any) {
      logOperationalEvent('auth_login_google_failure', { error: error.message || error });
      console.error('[PestFlow AuthService] Google Sign-In Error:', error);
      throw error;
    }
  }

  /**
   * Technical Email identity login bypass
   */
  static async loginWithEmail(email: string, password: string): Promise<UserProfile> {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const profile = await this.syncUserProfile(result.user);
      logOperationalEvent('auth_login_email_success', { uid: profile.uid, role: profile.role });
      return profile;
    } catch (error: any) {
      logOperationalEvent('auth_login_email_failure', { email, error: error.message || error });
      console.error('[PestFlow AuthService] Email Sign-In Error:', error);
      throw error;
    }
  }

  /**
   * Internal database profile sync & lazy provisioning
   */
  private static async syncUserProfile(firebaseUser: FirebaseUser): Promise<UserProfile> {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const existingProfile = snap.data() as UserProfile;
      // Symmetrically update last login timestamp without mutating base structure
      await setDoc(userRef, {
        ...existingProfile,
        lastLogin: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      return { 
        ...existingProfile,
        lastLogin: new Date().toISOString()
      };
    } else {
      // Every new user created via login must be technician and active by default, without exceptions
      const newProfile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Colaborador PestFlow',
        role: 'technician',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      
      await setDoc(userRef, newProfile);
      return newProfile;
    }
  }

  /**
   * Separate and explicit flow for role promotion.
   * Only an already authenticated user with role === 'admin' can alter the role field of another user.
   */
  static async promoteUserRole(targetUid: string, newRole: UserRole): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Usuário não autenticado.');
    }

    const currentUid = currentUser.uid;
    const adminRef = doc(db, 'users', currentUid);

    try {
      // Verify admin permissions
      const adminSnap = await getDoc(adminRef);
      if (!adminSnap.exists() || (adminSnap.data() as UserProfile).role !== 'admin') {
        throw new Error('Apenas usuários com papel de administrador podem alterar o papel de outros colaboradores.');
      }
    } catch (error: any) {
      if (error.message && error.message.includes('Apenas usuários com papel')) {
        throw error;
      }
      handleFirestoreError(error, OperationType.GET, `users/${currentUid}`);
    }

    const targetRef = doc(db, 'users', targetUid);
    try {
      // Update target user's role
      await setDoc(targetRef, {
        role: newRole,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      logOperationalEvent('auth_promote_role_success', { 
        adminUid: currentUid, 
        targetUid, 
        newRole 
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${targetUid}`);
    }
  }

  /**
   * Terminate active sessions
   */
  static async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error('Nenhum usuário autenticado.');
    }
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
  }

  /**
   * Terminate active sessions
   */
  static async logout(): Promise<void> {
    try {
      const currentUid = auth.currentUser?.uid;
      await signOut(auth);
      logOperationalEvent('auth_logout_success', { uid: currentUid });
    } catch (error: any) {
      logOperationalEvent('auth_logout_failure', { error: error.message || error });
      console.error('[PestFlow AuthService] Logout Error:', error);
      throw error;
    }
  }

  /**
   * Live Firestore sync of active user profile changes
   */
  static listenUserProfile(uid: string, callback: (profile: UserProfile | null) => void): () => void {
    const userRef = doc(db, 'users', uid);
    
    // Fallback if client is offline or permissions aren't fully processed yet
    const timeout = setTimeout(async () => {
      try {
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          callback(snap.data() as UserProfile);
        }
      } catch (e) {
        console.warn('[PestFlow AuthService] Profile stream fallback polling failed:', e);
      }
    }, 1500);

    return () => clearTimeout(timeout);
  }
}
