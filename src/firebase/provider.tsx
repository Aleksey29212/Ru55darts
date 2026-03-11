'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { isFirebaseConfigValid } from './config';

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
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
    if (!auth || !isFirebaseConfigValid) {
        setUserAuthState(prev => ({ ...prev, isAuthAttempted: true, isUserLoading: false }));
        return;
    }

    let isMounted = true;

    const performAuth = async () => {
        try {
            if (!auth.currentUser) {
                await signInAnonymously(auth);
            }
            if (isMounted) setUserAuthState(prev => ({ ...prev, isAuthAttempted: true }));
        } catch (error) {
            if (isMounted) setUserAuthState(prev => ({ ...prev, isAuthAttempted: true }));
        }
    };

    performAuth();

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (isMounted) setUserAuthState({ user: firebaseUser, isUserLoading: false, userError: null, isAuthAttempted: true });
    }, (error) => {
        if (isMounted) setUserAuthState(prev => ({ ...prev, isUserLoading: false, userError: error, isAuthAttempted: true }));
    });
    
    return () => { isMounted = false; unsubscribe(); };
  }, [auth]);

  const contextValue = useMemo((): FirebaseContextState => {
    const servicesAvailable = !!(firebaseApp && firestore && auth && userAuthState.isAuthAttempted && isFirebaseConfigValid);
    return {
      areServicesAvailable: servicesAvailable,
      firebaseApp,
      firestore,
      auth,
      user: userAuthState.user,
      isUserLoading: userAuthState.isUserLoading,
      userError: userAuthState.userError,
    };
  }, [firebaseApp, firestore, auth, userAuthState]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = (): FirebaseContextState | null => useContext(FirebaseContext);
export const useAuth = (): Auth | null => useFirebase()?.auth || null;
export const useFirestore = (): Firestore | null => useFirebase()?.firestore || null;
export const useFirebaseApp = (): FirebaseApp | null => useFirebase()?.firebaseApp || null;

type MemoFirebase <T> = T & {__memo?: boolean};
export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T | (MemoFirebase<T>) {
  const memoized = useMemo(factory, deps);
  if(typeof memoized !== 'object' || memoized === null) return memoized;
  (memoized as MemoFirebase<T>).__memo = true;
  return memoized;
}

export const useUser = () => { 
  const context = useFirebase();
  return { user: context?.user || null, isUserLoading: context?.isUserLoading ?? true, userError: context?.userError || null };
};
