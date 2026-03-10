import { firebaseConfig, isFirebaseConfigValid } from '@/firebase/config';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

/**
 * @fileOverview Инициализация Firebase на стороне сервера (Server Actions и RSC).
 * ГАРАНТИЯ: Устойчивая работа в Next.js 15 без утечек памяти и дублирования приложений.
 */

function getFirebaseApp(): FirebaseApp | null {
    const apps = getApps();
    if (apps.length > 0) {
        return apps[0];
    }

    if (!isFirebaseConfigValid) {
        return null;
    }

    try {
        return initializeApp(firebaseConfig, "server-app");
    } catch (e) {
        console.error("Server Firebase init failed:", e);
        return null;
    }
}

export function getDb(): Firestore {
    const app = getFirebaseApp();
    if (!app) {
        // Если БД не инициализирована на сервере, бросаем ошибку,
        // которую перехватит error.js или RootLayout (через Config Guard)
        throw new Error("CRITICAL: Firebase configuration missing on server side.");
    }
    return getFirestore(app);
}
