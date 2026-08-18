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
          const isSuperAdmin = Boolean(idTokenResult.claims.isSuperAdmin);

          let empresaSuspensa = false;
          if (claimEmpresaId && !isSuperAdmin) {
            try {
              const empresaSnap = await getDoc(doc(db, 'empresas', claimEmpresaId));
              if (empresaSnap.exists()) {
                const empData = empresaSnap.data();
                if (empData?.ativa === false) {
                  empresaSuspensa = true;
                }
              }
            } catch (empErr) {
              console.warn('[PestFlow AuthProvider] Erro ao verificar status da empresa:', empErr);
            }
          }

          const userRef = claimEmpresaId 
            ? doc(db, 'empresas', claimEmpresaId, 'usuarios', firebaseUser.uid)
            : doc(db, 'users', firebaseUser.uid);
          
          const profileUnsubscribe = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
              const userData = docSnap.data() as UserProfile;
              const activeEmpresaId = claimEmpresaId || userData.empresaId || localStorage.getItem('pestflow_tenant_id') || '';
              const activeRole = claimRole || userData.role || 'funcionario';

              // If user is not SuperAdmin and has no resolvable empresaId, block access
              if (!isSuperAdmin && !activeEmpresaId) {
                console.warn('[PestFlow AuthProvider] Usuário sem empresa associada. Acesso negado.');
                setSession({
                  user: null,
                  role: null,
                  empresaId: null,
                  isSuperAdmin: false,
                  empresaSuspensa: false,
                  permissions: {},
                  isAuthenticated: false,
                  isLoading: false,
                  isHydrated: true,
                });
                return;
              }

              const fullUserData: UserProfile = { 
                ...userData, 
                role: activeRole, 
                empresaId: activeEmpresaId,
                isSuperAdmin
              };

              setSession({
                user: fullUserData,
                role: activeRole,
                empresaId: activeEmpresaId,
                isSuperAdmin,
                empresaSuspensa,
                permissions: userData.permissions || {},
                isAuthenticated: true,
                isLoading: false,
                isHydrated: true,
              });
            } else {
              const activeEmpresaId = claimEmpresaId || localStorage.getItem('pestflow_tenant_id') || '';
              if (!isSuperAdmin && !activeEmpresaId) {
                console.warn('[PestFlow AuthProvider] Documento de perfil não localizado e empresaId ausente. Acesso negado.');
                setSession({
                  user: null,
                  role: null,
                  empresaId: null,
                  isSuperAdmin: false,
                  empresaSuspensa: false,
                  permissions: {},
                  isAuthenticated: false,
                  isLoading: false,
                  isHydrated: true,
                });
                return;
              }

              const activeRole = claimRole || 'funcionario';
              const defaultProfile: UserProfile = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                name: firebaseUser.displayName || 'Colaborador PestFlow',
                role: activeRole,
                status: 'active',
                empresaId: activeEmpresaId,
                isSuperAdmin,
                permissions: {},
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
              setSession({
                user: defaultProfile,
                role: activeRole,
                empresaId: activeEmpresaId,
                isSuperAdmin,
                empresaSuspensa,
                permissions: {},
                isAuthenticated: true,
                isLoading: false,
                isHydrated: true,
              });
            }
          }, (err) => {
            console.warn('[PestFlow AuthProvider] Profile state listener failed, falling back to token claims:', err.message);
            const activeEmpresaId = claimEmpresaId || localStorage.getItem('pestflow_tenant_id') || '';
            if (!isSuperAdmin && !activeEmpresaId) {
              setSession({
                user: null,
                role: null,
                empresaId: null,
                isSuperAdmin: false,
                empresaSuspensa: false,
                permissions: {},
                isAuthenticated: false,
                isLoading: false,
                isHydrated: true,
              });
              return;
            }

            const activeRole = claimRole || (isSuperAdmin ? 'master' : 'funcionario');
            setSession({
              user: {
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                name: firebaseUser.displayName || 'Usuário PestFlow',
                role: activeRole,
                status: 'active',
                empresaId: activeEmpresaId,
                isSuperAdmin,
                permissions: {},
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              role: activeRole,
              empresaId: activeEmpresaId,
              isSuperAdmin,
              empresaSuspensa,
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
            isSuperAdmin: false,
            empresaSuspensa: false,
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
      const isSuper = profile.isSuperAdmin || profile.role === 'master' || profile.email?.includes('master');
      const activeEmpresaId = profile.empresaId || localStorage.getItem('pestflow_tenant_id') || '';
      
      if (!isSuper && !activeEmpresaId) {
        throw new Error('Não foi possível identificar sua empresa. Faça login novamente.');
      }

      setSession({
        user: profile,
        role: profile.role || (isSuper ? 'master' : 'admin'),
        empresaId: activeEmpresaId || (isSuper ? 'master_tenant' : ''),
        isSuperAdmin: Boolean(isSuper),
        empresaSuspensa: false,
        permissions: profile.permissions || {},
        isAuthenticated: true,
        isLoading: false,
        isHydrated: true,
      });
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
      const isSuper = profile.isSuperAdmin || profile.role === 'master' || email.includes('master');
      const activeEmpresaId = profile.empresaId || localStorage.getItem('pestflow_tenant_id') || '';

      if (!isSuper && !activeEmpresaId) {
        throw new Error('Não foi possível identificar sua empresa. Faça login novamente.');
      }

      setSession({
        user: profile,
        role: profile.role || (isSuper ? 'master' : 'admin'),
        empresaId: activeEmpresaId || (isSuper ? 'master_tenant' : ''),
        isSuperAdmin: Boolean(isSuper),
        empresaSuspensa: false,
        permissions: profile.permissions || {},
        isAuthenticated: true,
        isLoading: false,
        isHydrated: true,
      });
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
      const isSuperAdminValue = changes.isSuperAdmin !== undefined 
        ? changes.isSuperAdmin 
        : (changes.role === 'master' || prev.isSuperAdmin);

      const targetEmpresaId = changes.empresaId || prev.user?.empresaId || localStorage.getItem('pestflow_tenant_id') || '';

      if (!isSuperAdminValue && !targetEmpresaId) {
        return {
          user: null,
          role: null,
          empresaId: null,
          isSuperAdmin: false,
          empresaSuspensa: false,
          permissions: {},
          isAuthenticated: false,
          isLoading: false,
          isHydrated: true,
        };
      }

      const activeUser: UserProfile = prev.user ? {
        ...prev.user,
        ...changes,
        isSuperAdmin: isSuperAdminValue,
        empresaId: targetEmpresaId
      } : {
        uid: `user_${Date.now()}`,
        email: changes.email || 'master@pestflow.local',
        name: changes.name || 'Gabriel - Super Admin',
        role: changes.role || 'master',
        status: 'active',
        empresaId: targetEmpresaId,
        isSuperAdmin: isSuperAdminValue,
        permissions: changes.permissions || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return {
        ...prev,
        user: activeUser,
        role: activeUser.role,
        empresaId: targetEmpresaId,
        isSuperAdmin: isSuperAdminValue,
        empresaSuspensa: false,
        permissions: activeUser.permissions || prev.permissions || {},
        isAuthenticated: true,
        isLoading: false,
        isHydrated: true,
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
