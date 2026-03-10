/**
 * @fileOverview Конфигурация Firebase. 
 * ГАРАНТИЯ: Использование переменных окружения для безопасного развертывания на любом хостинге.
 */

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com` : '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

// Простая проверка: если ключ API пустой или слишком короткий, считаем конфиг невалидным
export const isFirebaseConfigValid = !!firebaseConfig.apiKey && firebaseConfig.apiKey.length > 10;
