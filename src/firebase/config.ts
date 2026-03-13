/**
 * @fileOverview Универсальная конфигурация Firebase для любого хостинга.
 * Система автоматически считывает ключи из переменных окружения хостинга.
 */

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET || (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com` : ''),
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

/**
 * Проверка валидности конфигурации.
 * Если ключи не заданы в панели хостинга, система перейдет в режим Demo (локальная память).
 */
export const isFirebaseConfigValid = 
    !!firebaseConfig.apiKey && 
    firebaseConfig.apiKey.length > 10 && 
    !!firebaseConfig.projectId &&
    !firebaseConfig.projectId.includes('project-id');
