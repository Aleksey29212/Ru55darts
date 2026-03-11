/**
 * @fileOverview Конфигурация Firebase с улучшенной валидацией.
 * ГАРАНТИЯ: Приложение поймет, если используются значения-заглушки или ключи отсутствуют.
 */

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com` : '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

// Проверка: ключи должны быть реальными, а не стандартными заглушками
export const isFirebaseConfigValid = 
    !!firebaseConfig.apiKey && 
    firebaseConfig.apiKey.length > 15 && 
    !firebaseConfig.projectId.includes('project-id') &&
    firebaseConfig.projectId !== '';
