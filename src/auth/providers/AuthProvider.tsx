import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/firebase/config';
import { UserProfile, UserRole } from '@/types/database';
import { ROLE_PERMISSIONS } from '../permissions';
import { AuthSession, UserPermission } from '../types';
import { logOperationalEvent } from '@/firebase/analytics';

interface AuthContextType extends AuthSession {
  loginWithGoogle: () => Promise<UserProfile>;
  loginWithEmail: (e: string, p: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
  updateProfileState: (changes: Partial<UserProfile>) => void;
}

const defaultPermissions: UserPermission[] = ROLE_PERMISSIONS.admin;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession>({
    user: null,
    role: null,
    empresaId: null,
    permissions: [],
    isAuthenticated: false,
    isLoading: true,
    isHydrated: false,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const idTokenResult = await firebaseUser.getIdTokenResult(true);
          const claimEmpresaId = (idTokenResult.claims.empresaId as string) || '';

          const userRef = doc(db, 'users', firebaseUser.uid);
          
          const profileUnsubscribe = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
              const userData = docSnap.data() as UserProfile;
              const activeEmpresaId = claimEmpresaId || userData.empresaId || '';
              const fullUserData: UserProfile = { ...userData, empresaId: activeEmpresaId };
              setSession({
                user: fullUserData,
                role: userData.role,
                empresaId: activeEmpresaId,
                permissions: ROLE_PERMISSIONS[userData.role] || [],
                isAuthenticated: true,
                isLoading: false,
                isHydrated: true,
              });
            } else {
              const defaultProfile: UserProfile = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                name: firebaseUser.displayName || 'Colaborador PestFlow',
                role: 'technician',
                status: 'active',
                empresaId: claimEmpresaId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
              setSession({
                user: defaultProfile,
                role: 'technician',
                empresaId: claimEmpresaId,
                permissions: ROLE_PERMISSIONS.technician,
                isAuthenticated: true,
                isLoading: false,
                isHydrated: true,
              });
            }
          }, (err) => {
            console.warn('[PestFlow AuthProvider] Profile state listener failed, falling back to token claims:', err.message);
            setSession({
              user: {
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                name: firebaseUser.displayName || 'Usuário PestFlow',
                role: 'admin',
                status: 'active',
                empresaId: claimEmpresaId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              role: 'admin',
              empresaId: claimEmpresaId,
              permissions: ROLE_PERMISSIONS.admin,
              isAuthenticated: true,
              isLoading: false,
              isHydrated: true,
            });
          });

          return () => profileUnsubscribe();
        } else {
          setSession({
            user: null,
            role: null,
            empresaId: null,
            permissions: [],
            isAuthenticated: false,
            isLoading: false,
            isHydrated: true,
          });
        }
      } catch (error: any) {
        console.error('[PestFlow AuthProvider] Session initialization incident:', error);
        setSession(prev => ({ ...prev, isLoading: false, isHydrated: true }));
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const { AuthService } = await import('../services/auth');
    setSession(prev => ({ ...prev, isLoading: true }));
    try {
      const profile = await AuthService.loginWithGoogle();
      return profile;
    } catch (err) {
      setSession(prev => ({ ...prev, isLoading: false }));
      throw err;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    const { AuthService } = await import('../services/auth');
    setSession(prev => ({ ...prev, isLoading: true }));
    try {
      const profile = await AuthService.loginWithEmail(email, pass);
      return profile;
    } catch (err) {
      setSession(prev => ({ ...prev, isLoading: false }));
      throw err;
    }
  };

  const logout = async () => {
    const { AuthService } = await import('../services/auth');
    setSession(prev => ({ ...prev, isLoading: true }));
    try {
      await AuthService.logout();
    } finally {
      setSession({
        user: null,
        role: null,
        empresaId: null,
        permissions: [],
        isAuthenticated: false,
        isLoading: false,
        isHydrated: true,
      });
    }
  };

  const updateProfileState = (changes: Partial<UserProfile>) => {
    setSession(prev => {
      if (!prev.user) return prev;
      const updatedUser = { ...prev.user, ...changes };
      return {
        ...prev,
        user: updatedUser,
        role: updatedUser.role,
        permissions: ROLE_PERMISSIONS[updatedUser.role] || []
      };
    });
  };

  return (
    <AuthContext.Provider value={{
      ...session,
      loginWithGoogle,
      loginWithEmail,
      logout,
      updateProfileState
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be utilized within an AuthProvider');
  }
  return context;
}
