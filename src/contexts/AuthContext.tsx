import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: UserRole | null;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, role: null });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>({
    uid: 'root',
    email: 'admin@ddsulf.com',
    name: 'Administrador',
    role: 'admin',
    createdAt: new Date().toISOString()
  });
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<UserRole | null>('admin');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Fetch additional user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setUser(userData);
            setRole(userData.role);
          } else {
            // Fallback if user document doesn't exist yet
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: 'Usuário Convidado',
              role: 'admin',
              createdAt: new Date().toISOString()
            });
            setRole('admin');
          }
        } else {
          // Mock user for temporary access - stay as mock
          setUser({
            uid: 'root',
            email: 'admin@ddsulf.com',
            name: 'Administrador',
            role: 'admin',
            createdAt: new Date().toISOString()
          });
          setRole('admin');
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, role }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
