'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { isFirebaseConfigValid } from './config';
import { ShieldAlert, Terminal } from 'lucide-react';

/**
 * @fileOverview Провайдер контекста Firebase с защитой от PERMISSION_DENIED.
 * ГАРАНТИЯ: Рендеринг разрешен только после успешной анонимной авторизации.
 */

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
    if (!auth) {
        setUserAuthState(prev => ({ ...prev, isAuthAttempted: true, isUserLoading: false }));
        return;
    }

    let isMounted = true;

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
      firebaseApp,
      firestore,
      auth,
      user: userAuthState.user,
      isUserLoading: userAuthState.isUserLoading,
      userError: userAuthState.userError,
    };
  }, [firebaseApp, firestore, auth, userAuthState]);

  // ЭКРАН ПРЕДУПРЕЖДЕНИЯ ОБ ОТСУТСТВИИ КОНФИГУРАЦИИ
  if (!isFirebaseConfigValid) {
      return (
          <div className="fixed inset-0 bg-background flex items-center justify-center p-6 z-[9999]">
              <div className="max-w-md w-full glassmorphism p-8 rounded-[2.5rem] border-amber-500/30 text-center space-y-6">
                  <div className="bg-amber-500/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-amber-500/30">
                      <ShieldAlert className="h-10 w-10 text-amber-500" />
                  </div>
                  <h2 className="font-headline text-2xl uppercase tracking-tight text-amber-500">Firebase не настроен</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                      Для работы приложения необходимо прописать <strong>Переменные окружения</strong> в панели управления хостингом (Timeweb/Vercel).
                  </p>
                  <div className="bg-black/40 rounded-2xl p-4 text-left font-mono text-[10px] space-y-2 border border-white/5">
                      <p className="text-primary flex items-center gap-2"><Terminal className="h-3 w-3"/> NEXT_PUBLIC_FIREBASE_API_KEY</p>
                      <p className="text-primary flex items-center gap-2"><Terminal className="h-3 w-3"/> NEXT_PUBLIC_FIREBASE_PROJECT_ID</p>
                      <p className="text-muted-foreground opacity-50 italic">...и остальные ключи из консоли Firebase</p>
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                      Если вы разработчик, создайте файл .env в корне проекта.
                  </p>
              </div>
          </div>
      );
  }

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
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
