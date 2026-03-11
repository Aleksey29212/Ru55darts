import { firebaseConfig, isFirebaseConfigValid } from '@/firebase/config';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

/**
 * @fileOverview Инициализация Firebase на стороне сервера (Server Actions и RSC).
 * ГАРАНТИЯ: Устойчивая работа даже при отсутствии ключей.
 */

function getFirebaseApp(): FirebaseApp | null {
    if (typeof window !== 'undefined') return null;

    const apps = getApps();
    const existingApp = apps.find(app => app.name === "server-app");
    if (existingApp) return existingApp;

    // КРИТИЧЕСКИЙ GUARD: если ключи API невалидны, просто возвращаем null
    if (!isFirebaseConfigValid) {
        return null;
    }

    try {
        return initializeApp(firebaseConfig, "server-app");
    } catch (e) {
        return null;
    }
}

/**
 * Возвращает экземпляр Firestore или null, если конфигурация не задана.
 * Мы больше не выбрасываем ошибки (throw), чтобы система работала в демо-режиме.
 */
export function getDb(): Firestore | null {
    const app = getFirebaseApp();
    if (!app) {
        return null;
    }
    try {
        return getFirestore(app);
    } catch (e) {
        return null;
    }
}
