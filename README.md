# DartBrig Pro - Система управления рейтингами (v2.8 Stable)

Современная платформа для автоматизации дартс-турниров. Построена на стеке **Next.js 15**, **Tailwind CSS** и **Firebase**.

## 🛠 Технический стек
- **Framework**: Next.js 15 (App Router)
- **Backend**: Firebase Firestore (Облачная БД)
- **Auth**: Firebase Auth (Anonymous)
- **Deployment**: Docker / Firebase App Hosting

## 🚀 Варианты деплоя

### Вариант А: Firebase App Hosting (Без сторонних серверов)
Самый простой способ развернуть сайт в той же среде, где находится ваша база данных.
1. Зайдите в [Консоль Firebase](https://console.firebase.google.com/).
2. Раздел **Build** -> **App Hosting**.
3. Нажмите **Get Started** и подключите ваш репозиторий GitHub: `Aleksey29212/Ru55darts`.
4. Firebase автоматически обнаружит настройки в `apphosting.yaml` и развернет сайт.

### Вариант Б: Timeweb Cloud (Docker-compose)
Если вам нужен хостинг в РФ с оплатой в рублях.
1. Создайте проект **«Приложение из Docker-compose»** в Timeweb.
2. Подключите ваш GitHub репозиторий.
3. Добавьте переменные окружения в панели Timeweb:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_ADMIN_PASSWORD`

## 🔑 Где взять ключи Firebase?
1. В консоли Firebase перейдите в **Project Settings** (шестеренка вверху).
2. Вкладка **General**, внизу раздел **Your apps** -> **Web App**.
3. Нажмите **Config** и скопируйте значения.

---
Разработано для профессионального сообщества. Аудит математики и Docker-конфигурации пройден (v2.8 Stable).
