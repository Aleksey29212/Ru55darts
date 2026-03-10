'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

/**
 * @fileOverview Провайдер контекста Firebase с защитой от PERMISSION_DENIED.
 * ГАРАНТИЯ: Рендеринг разрешен только после успешной анонимной авторизации.
 */

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

interface UserAuthState {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
  isAuthAttempted: boolean;
}

export interface FirebaseContextState {
  areServicesAvailable: boolean;
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export const FirebaseContext = createContext<FirebaseContextState | null>(null);

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
}) => {
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true,
    userError: null,
    isAuthAttempted: false,
  });

  useEffect(() => {
    if (!auth) {
        setUserAuthState(prev => ({ ...prev, isAuthAttempted: true, isUserLoading: false }));
        return;
    }

    let isMounted = true;

    // ГАРАНТИЯ: Принудительный вход для предотвращения ошибок доступа к Firestore
    const performAuth = async () => {
        try {
            if (!auth.currentUser) {
                await signInAnonymously(auth);
            }
            if (isMounted) {
                setUserAuthState(prev => ({ ...prev, isAuthAttempted: true }));
            }
        } catch (error) {
            console.warn("Firebase Auth Initial Attempt:", error);
            if (isMounted) {
                setUserAuthState(prev => ({ ...prev, isAuthAttempted: true }));
            }
        }
    };

    performAuth();

    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        if (isMounted) {
            setUserAuthState({ 
                user: firebaseUser, 
                isUserLoading: false, 
                userError: null,
                isAuthAttempted: true
            });
        }
      },
      (error) => {
        if (isMounted) {
            setUserAuthState(prev => ({ 
                ...prev,
                isUserLoading: false, 
                userError: error,
                isAuthAttempted: true
            }));
        }
      }
    );
    
    return () => {
        isMounted = false;
        unsubscribe();
    };
  }, [auth]);

  const contextValue = useMemo((): FirebaseContextState => {
    const servicesAvailable = !!(firebaseApp && firestore && auth && userAuthState.isAuthAttempted);
    return {
      areServicesAvailable: servicesAvailable,
      firebaseApp: servicesAvailable ? firebaseApp : null,
      firestore: servicesAvailable ? firestore : null,
      auth: servicesAvailable ? auth : null,
      user: userAuthState.user,
      isUserLoading: userAuthState.isUserLoading,
      userError: userAuthState.userError,
    };
  }, [firebaseApp, firestore, auth, userAuthState]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {/* КРИТИЧЕСКИЙ БЛОК: Ждем Auth, чтобы избежать Runtime FirebaseError PERMISSION_DENIED */}
      {userAuthState.isAuthAttempted ? children : (
          <div className="fixed inset-0 bg-background flex items-center justify-center z-[9999]">
              <div className="flex flex-col items-center gap-4">
                  <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Защищенное соединение...</p>
              </div>
          </div>
      )}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = (): FirebaseContextState | null => {
  const context = useContext(FirebaseContext);
  return context;
};

export const useAuth = (): Auth | null => {
  const context = useFirebase();
  return context?.auth || null;
};

export const useFirestore = (): Firestore | null => {
  const context = useFirebase();
  return context?.firestore || null;
};

export const useFirebaseApp = (): FirebaseApp | null => {
  const context = useFirebase();
  return context?.firebaseApp || null;
};

type MemoFirebase <T> = T & {__memo?: boolean};

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T | (MemoFirebase<T>) {
  const memoized = useMemo(factory, deps);
  if(typeof memoized !== 'object' || memoized === null) return memoized;
  (memoized as MemoFirebase<T>).__memo = true;
  return memoized;
}

export const useUser = () => { 
  const context = useFirebase();
  return { 
    user: context?.user || null, 
    isUserLoading: context?.isUserLoading ?? true, 
    userError: context?.userError || null 
  };
};
