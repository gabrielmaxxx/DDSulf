import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../config';
import { getDocument, createDocument } from '../firestore';
import { User } from '@/types';

export const googleProvider = new GoogleAuthProvider();

/**
 * Perform login using Google authentication popup in tenant scope
 */
export async function loginWithGoogle(empresaId?: string): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;
    
    // Check if user has an existing profiling document in tenant scope
    let profile = await getDocument<User>('users', firebaseUser.uid, empresaId);
    if (!profile) {
      profile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || 'Colaborador PestFlow',
        role: 'technician',
        createdAt: new Date().toISOString()
      };
      await createDocument('users', firebaseUser.uid, profile, empresaId);
    }
    return profile;
  } catch (error) {
    console.error('[PestFlow Auth Service] Error during sign-in popup:', error);
    throw error;
  }
}

/**
 * Terminate user authentication session
 */
export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('[PestFlow Auth Service] Error during sign-out:', error);
    throw error;
  }
}

/**
 * Retrieve current user profile explicitly in tenant scope
 */
export async function getUserProfile(uid: string, empresaId?: string): Promise<User | null> {
  return await getDocument<User>('users', uid, empresaId);
}
