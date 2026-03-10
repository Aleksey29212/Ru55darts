import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

/**
 * @fileOverview Инициализация Firebase на стороне сервера (Server Actions и RSC).
 * ГАРАНТИЯ: Устойчивая работа в Next.js 15 без утечек памяти и дублирования приложений.
 */

let serverApp: FirebaseApp;

function getFirebaseApp(): FirebaseApp {
    const apps = getApps();
    if (apps.length > 0) {
        return apps[0];
    }

    // В среде App Hosting или Vercel используем явную конфигурацию из config.ts
    // которая в свою очередь берет данные из переменных окружения
    if (!serverApp) {
        serverApp = initializeApp(firebaseConfig, "server-app");
    }
    return serverApp;
}

export function getDb(): Firestore {
    const app = getFirebaseApp();
    return getFirestore(app);
}
