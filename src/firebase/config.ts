/**
 * @fileOverview Конфигурация Firebase. 
 * ГАРАНТИЯ: Использование переменных окружения с безопасными фоллбеками для стабильного деплоя.
 */

export const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-7014233606-4de9e",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:764584273022:web:dd5f4b95c21108431f642f",
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDusyJImX8N4VScBkJdFX1kzu09iOhIvQU",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "studio-7014233606-4de9e.firebaseapp.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "764584273022",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ""
};
