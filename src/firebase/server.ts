import { firebaseConfig, isFirebaseConfigValid } from '@/firebase/config';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

/**
 * @fileOverview Инициализация Firebase на стороне сервера (Server Actions и RSC).
 * ГАРАНТИЯ: Устойчивая работа в Next.js 15 без утечек памяти и дублирования приложений.
 */

function getFirebaseApp(): FirebaseApp | null {
    // На стороне клиента это не должно вызываться, но добавим проверку
    if (typeof window !== 'undefined') return null;

    const apps = getApps();
    // Ищем уже созданное приложение с нашим именем сервера
    const existingApp = apps.find(app => app.name === "server-app");
    if (existingApp) return existingApp;

    // Если ключей нет, возвращаем null. Ошибка будет обработана в библиотеках или UI.
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
 * Больше не выбрасывает ошибку (throw), чтобы не ломать рендеринг при сборке.
 */
export function getDb(): Firestore | null {
    const app = getFirebaseApp();
    if (!app) {
        return null;
    }
    return getFirestore(app);
}
