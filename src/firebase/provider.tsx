'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { isFirebaseConfigValid, firebaseConfig } from './config';
import { ShieldAlert, Terminal, AlertCircle, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * @fileOverview Провайдер контекста Firebase с защитой от ошибок конфигурации.
 * ГАРАНТИЯ: Понятное уведомление пользователя вместо падения приложения.
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

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

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

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

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

  // ЭКРАН ПОМОЩНИКА КОНФИГУРАЦИИ
  if (!isFirebaseConfigValid) {
      return (
          <div className="fixed inset-0 bg-background flex items-center justify-center p-4 md:p-6 z-[9999] overflow-y-auto">
              <div className="max-w-2xl w-full glassmorphism p-6 md:p-10 rounded-[2rem] border-amber-500/30 space-y-8 my-auto animate-in fade-in zoom-in-95 duration-500">
                  <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left border-b border-white/5 pb-8">
                      <div className="bg-amber-500/20 w-20 h-20 rounded-3xl flex items-center justify-center border-2 border-amber-500/30 shrink-0 shadow-2xl shadow-amber-500/20">
                          <ShieldAlert className="h-10 w-10 text-amber-500" />
                      </div>
                      <div>
                          <h2 className="font-headline text-2xl md:text-3xl uppercase tracking-tight text-amber-500">Система не настроена</h2>
                          <p className="text-muted-foreground mt-2 text-sm md:text-base">Для работы <strong>DartBrig Pro</strong> на сервере <strong>Wise Crane</strong> необходимо добавить ключи Firebase.</p>
                      </div>
                  </div>

                  <div className="space-y-4">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                          <Terminal className="h-3.5 w-3.5" /> 
                          Переменные для файла .env или Timeweb Cloud:
                      </p>
                      <div className="grid gap-3">
                          {[
                              'NEXT_PUBLIC_FIREBASE_API_KEY',
                              'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
                              'NEXT_PUBLIC_FIREBASE_APP_ID',
                              'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
                              'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
                              'NEXT_PUBLIC_ADMIN_PASSWORD'
                          ].map((key) => (
                              <div key={key} className="group flex items-center justify-between bg-black/40 rounded-xl p-3 md:p-4 border border-white/5 hover:border-primary/30 transition-all">
                                  <code className="text-[10px] md:text-xs text-primary font-bold">{key}</code>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 px-2 text-[10px] uppercase font-bold text-muted-foreground hover:text-primary"
                                    onClick={() => copyToClipboard(key, key)}
                                  >
                                      {copiedKey === key ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                                      {copiedKey === key ? 'Ок' : 'Копировать'}
                                  </Button>
                              </div>
                          ))}
                      </div>
                  </div>

                  <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                      <p className="text-xs text-muted-foreground leading-relaxed italic text-center">
                          <strong>Для VPS:</strong> Создайте файл <code>.env.local</code> в корне проекта на сервере и вставьте туда эти ключи со значениями из Firebase Console. После этого выполните <code>npm run build</code> и <code>npm start</code>.
                      </p>
                  </div>
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
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Установка соединения...</p>
              </div>
          </div>
      )}
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
