import React, { createContext, useContext } from 'react';
import { useAuthContext } from '../auth/providers/AuthProvider';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: UserRole | null;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, role: null });

/**
 * Backward-compatible context adapter mapping existing components to the new enterprise Auth Provider
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading, role } = useAuthContext();

  const legacyUserMapped: User | null = user ? {
    uid: user.uid,
    email: user.email,
    name: user.name,
    role: user.role as any,
    createdAt: user.createdAt
  } : null;

  return (
    <AuthContext.Provider value={{ 
      user: legacyUserMapped, 
      loading: isLoading, 
      role: role as any 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
