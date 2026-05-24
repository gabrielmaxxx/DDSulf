import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../config';
import { doc, getDocFromServer } from 'firebase/firestore';

interface FirebaseContextType {
  isReady: boolean;
  isOnline: boolean;
}

const FirebaseContext = createContext<FirebaseContextType>({ isReady: false, isOnline: true });

/**
 * Root React Provider to check connection state constraints and readiness thresholds
 */
export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    async function testConnection() {
      try {
        // GUIDELINE CRITICAL: Connect test leveraging DocFromServer retrieval
        await getDocFromServer(doc(db, 'test', 'connection'));
        setIsOnline(true);
        console.log('[DDSulf FirebaseProvider] Connected. Production database connection online.');
      } catch (error: any) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          setIsOnline(false);
          console.warn('[DDSulf FirebaseProvider] Operating in smart offline local cache mode.');
        } else {
          // If other error, we still consider initialized but log warning
          console.warn('[DDSulf FirebaseProvider] Server status checked:', error?.message || error);
        }
      } finally {
        setIsReady(true);
      }
    }
    testConnection();
  }, []);

  return (
    <FirebaseContext.Provider value={{ isReady, isOnline }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export const useFirebaseState = () => useContext(FirebaseContext);
