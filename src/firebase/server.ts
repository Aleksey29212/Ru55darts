import { firebaseConfig, isFirebaseConfigValid } from '@/firebase/config';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

/**
 * @fileOverview Инициализация Firebase на стороне сервера (Server Actions и RSC).
 * ГАРАНТИЯ: Устойчивая работа в Next.js 15 без утечек памяти и дублирования приложений.
 */

function getFirebaseApp(): FirebaseApp | null {
    const apps = getApps();
    // Ищем уже созданное приложение с нашим именем сервера
    const existingApp = apps.find(app => app.name === "server-app");
    if (existingApp) return existingApp;

    // Если ключей нет, не падаем сразу, а возвращаем null. Ошибка будет обработана в UI.
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
        // Выбрасываем понятную ошибку для серверных логов
        throw new Error("CRITICAL: Firebase configuration missing on server side. Check environment variables.");
    }
    return getFirestore(app);
}
