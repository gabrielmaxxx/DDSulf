import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../config';
import { getDocument, createDocument } from '../firestore';
import { User } from '@/types';
import { DEFAULT_EMPRESA_ID } from '../../tenant';

export const googleProvider = new GoogleAuthProvider();

/**
 * Perform login using Google authentication popup in tenant scope
 */
export async function loginWithGoogle(empresaId: string = DEFAULT_EMPRESA_ID): Promise<User> {
  // TODO(fase-2): substituir por empresaId extraído do custom claim do token
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;
    
    // Check if user has an existing profiling document in tenant scope
    let profile = await getDocument<User>('users', firebaseUser.uid, empresaId);
    if (!profile) {
      profile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || 'Colaborador DDSulf',
        role: 'technician', // Default role
        createdAt: new Date().toISOString()
      };
      await createDocument('users', firebaseUser.uid, profile, empresaId);
    }
    return profile;
  } catch (error) {
    console.error('[DDSulf Auth Service] Error during sign-in popup:', error);
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
    console.error('[DDSulf Auth Service] Error during sign-out:', error);
    throw error;
  }
}

/**
 * Retrieve current user profile explicitly in tenant scope
 */
export async function getUserProfile(uid: string, empresaId: string = DEFAULT_EMPRESA_ID): Promise<User | null> {
  // TODO(fase-2): substituir por empresaId extraído do custom claim do token
  return await getDocument<User>('users', uid, empresaId);
}
