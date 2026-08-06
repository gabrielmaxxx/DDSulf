import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/firebase/config';
import { UserProfile, UserRole } from '@/types/database';
import { AuthSession } from '../types';
import { logOperationalEvent } from '@/firebase/analytics';

interface AuthContextType extends AuthSession {
  loginWithGoogle: () => Promise<UserProfile>;
  loginWithEmail: (e: string, p: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
  updateProfileState: (changes: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession>({
    user: null,
    role: null,
    empresaId: null,
    permissions: {},
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
          const claimRole = (idTokenResult.claims.role as string) || '';

          const userRef = claimEmpresaId 
            ? doc(db, 'empresas', claimEmpresaId, 'usuarios', firebaseUser.uid)
            : doc(db, 'users', firebaseUser.uid);
          
          const profileUnsubscribe = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
              const userData = docSnap.data() as UserProfile;
              const activeEmpresaId = claimEmpresaId || userData.empresaId || '';
              const activeRole = claimRole || userData.role || 'funcionario';
              const fullUserData: UserProfile = { 
                ...userData, 
                role: activeRole, 
                empresaId: activeEmpresaId 
              };

              setSession({
                user: fullUserData,
                role: activeRole,
                empresaId: activeEmpresaId,
                permissions: userData.permissions || {},
                isAuthenticated: true,
                isLoading: false,
                isHydrated: true,
              });
            } else {
              const activeRole = claimRole || 'funcionario';
              const defaultProfile: UserProfile = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                name: firebaseUser.displayName || 'Colaborador PestFlow',
                role: activeRole,
                status: 'active',
                empresaId: claimEmpresaId,
                permissions: {},
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
              setSession({
                user: defaultProfile,
                role: activeRole,
                empresaId: claimEmpresaId,
                permissions: {},
                isAuthenticated: true,
                isLoading: false,
                isHydrated: true,
              });
            }
          }, (err) => {
            console.warn('[PestFlow AuthProvider] Profile state listener failed, falling back to token claims:', err.message);
            const activeRole = claimRole || 'master';
            setSession({
              user: {
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                name: firebaseUser.displayName || 'Usuário PestFlow',
                role: activeRole,
                status: 'active',
                empresaId: claimEmpresaId,
                permissions: {},
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              role: activeRole,
              empresaId: claimEmpresaId,
              permissions: {},
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
            permissions: {},
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
        permissions: {},
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
        permissions: updatedUser.permissions || prev.permissions || {}
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
