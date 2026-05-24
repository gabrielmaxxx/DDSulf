import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../config';
import { getDocument, createDocument } from '../firestore';
import { User } from '@/types';

export const googleProvider = new GoogleAuthProvider();

/**
 * Perform login using Google authentication popup
 */
export async function loginWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;
    
    // Check if user has an existing profiling document
    let profile = await getDocument<User>('users', firebaseUser.uid);
    if (!profile) {
      profile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || 'Colaborador DDSulf',
        role: 'technician', // Default role
        createdAt: new Date().toISOString()
      };
      await createDocument('users', firebaseUser.uid, profile);
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
 * Retrieve current user profile explicitly
 */
export async function getUserProfile(uid: string): Promise<User | null> {
  return await getDocument<User>('users', uid);
}
