'use client';

import { firebaseConfig, isFirebaseConfigValid } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore'

/**
 * @fileOverview Единая точка входа для инициализации Firebase SDK.
 * ГАРАНТИЯ: Безопасная инициализация без крашей при отсутствии ключей.
 */

export type FirebaseServices = {
  firebaseApp: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
}

export function initializeFirebase(): FirebaseServices {
  if (typeof window === 'undefined') return { firebaseApp: null, auth: null, firestore: null };

  const apps = getApps();
  if (apps.length > 0) {
    return getSdks(getApp());
  }

  if (!isFirebaseConfigValid) {
    console.warn("Firebase config is missing or invalid. Check environment variables.");
    return { firebaseApp: null, auth: null, firestore: null };
  }

  try {
    const firebaseApp = initializeApp(firebaseConfig);
    return getSdks(firebaseApp);
  } catch (e) {
    console.error("Firebase initialization failed:", e);
    return { firebaseApp: null, auth: null, firestore: null };
  }
}

export function getSdks(firebaseApp: FirebaseApp): FirebaseServices {
  try {
    return {
      firebaseApp,
      auth: getAuth(firebaseApp),
      firestore: getFirestore(firebaseApp)
    };
  } catch (e) {
    console.error("Failed to get Firebase services:", e);
    return { firebaseApp: null, auth: null, firestore: null };
  }
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
