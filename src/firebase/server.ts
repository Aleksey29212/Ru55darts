import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore'

/**
 * @fileOverview Server-side Firebase initialization (RSC and Server Actions).
 * Ensures correct project configuration is used even in different hosting environments.
 */

let db: Firestore;

function initializeDbOnServer() {
    let app;
    // We attempt to get the existing app or initialize a new one
    if (!getApps().length) {
        try {
            // Attempt to initialize using environment-provided credentials (for App Hosting)
            app = initializeApp();
        } catch (e) {
            // Fallback to the explicit config if automatic initialization fails
            app = initializeApp(firebaseConfig);
        }
    } else {
        app = getApp();
    }
    
    // Explicitly target the (default) database to ensure consistency
    return getFirestore(app);
}

export function getDb(): Firestore {
  if (!db) {
    db = initializeDbOnServer();
  }
  return db;
}