'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { isFirebaseConfigValid } from './config';
import { ShieldAlert, Terminal, Check, Copy, Settings2, Rocket, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

  if (!isFirebaseConfigValid) {
      return (
          <div className="fixed inset-0 bg-neutral-950 flex items-center justify-center p-4 md:p-6 z-[9999] overflow-y-auto">
              <div className="max-w-2xl w-full glassmorphism p-6 md:p-10 rounded-[2.5rem] border-primary/30 space-y-8 my-auto animate-in fade-in zoom-in-95 duration-500">
                  <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left border-b border-white/5 pb-8">
                      <div className="bg-primary/20 w-20 h-20 rounded-3xl flex items-center justify-center border-2 border-primary/30 shrink-0 shadow-2xl shadow-primary/20">
                          <Settings2 className="h-10 w-10 text-primary animate-spin-slow" />
                      </div>
                      <div>
                          <h2 className="font-headline text-2xl md:text-3xl uppercase tracking-tight text-primary">Мастер настройки</h2>
                          <p className="text-muted-foreground mt-2 text-sm md:text-base">Для запуска <strong>DartBrig Pro</strong> на вашем сервере необходимо добавить ключи из Firebase Console.</p>
                      </div>
                  </div>

                  <div className="space-y-6">
                      <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs">
                          <Rocket className="h-4 w-4" />
                          Шаг 1: Добавьте переменные на хостинг
                      </div>
                      <div className="grid gap-2">
                          {[
                              'NEXT_PUBLIC_FIREBASE_API_KEY',
                              'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
                              'NEXT_PUBLIC_FIREBASE_APP_ID',
                              'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
                              'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
                              'NEXT_PUBLIC_ADMIN_PASSWORD'
                          ].map((key) => (
                              <div key={key} className="group flex items-center justify-between bg-black/60 rounded-xl p-3 border border-white/5 hover:border-primary/30 transition-all">
                                  <code className="text-[10px] md:text-xs text-primary/80 font-bold">{key}</code>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 px-3 text-[10px] uppercase font-bold text-muted-foreground hover:text-primary gap-2"
                                    onClick={() => copyToClipboard(key, key)}
                                  >
                                      {copiedKey === key ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                      {copiedKey === key ? 'Готово' : 'Копировать'}
                                  </Button>
                              </div>
                          ))}
                      </div>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Где взять значения?</span>
                        <Button variant="link" className="h-auto p-0 text-primary text-[10px] font-bold uppercase" asChild>
                            <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer">
                                Консоль Firebase <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed italic">
                          Зайдите в <strong>Project Settings</strong> &rarr; <strong>General</strong> &rarr; <strong>Your apps</strong>. 
                          Выберите <strong>Web App</strong> и скопируйте значения из блока <code>firebaseConfig</code> в панель управления <strong>Timeweb</strong> или в файл <code>.env.local</code>.
                      </p>
                  </div>
                  
                  <div className="pt-4 text-center">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest opacity-40">Система автоматически заработает после обновления переменных</p>
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
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Установка связи...</p>
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
