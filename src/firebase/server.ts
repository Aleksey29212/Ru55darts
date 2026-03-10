import { firebaseConfig, isFirebaseConfigValid } from '@/firebase/config';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

/**
 * @fileOverview Инициализация Firebase на стороне сервера (Server Actions и RSC).
 * ГАРАНТИЯ: Устойчивая работа в Next.js 15 без утечек памяти и дублирования приложений.
 */

function getFirebaseApp(): FirebaseApp | null {
    // На стороне клиента это не должно вызываться
    if (typeof window !== 'undefined') return null;

    const apps = getApps();
    const existingApp = apps.find(app => app.name === "server-app");
    if (existingApp) return existingApp;

    // КРИТИЧЕСКИЙ GUARD: если ключи API невалидны, возвращаем null вместо ошибки
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

/**
 * Возвращает экземпляр Firestore или null, если конфигурация не задана.
 * Мы больше не используем throw Error, чтобы не ломать сборку и рендеринг.
 */
export function getDb(): Firestore | null {
    const app = getFirebaseApp();
    if (!app) {
        return null;
    }
    return getFirestore(app);
}
