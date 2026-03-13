# DartBrig Pro - Система управления рейтингами (v2.8 Stable)

Современная платформа для автоматизации дартс-турниров. Построена на стеке **Next.js 15**, **Tailwind CSS** и **Firebase**.

## 🛠 Технический стек
- **Framework**: Next.js 15 (App Router)
- **Backend**: Firebase Firestore (Облачная БД)
- **Auth**: Firebase Auth (Anonymous)
- **Deployment**: Docker / Node.js Standalone

## 🚀 Инструкция по деплою на Timeweb Cloud

### Шаг 1: Подготовка данных Firebase
Для работы сайта вам нужны ключи вашего проекта Firebase.
1. В [Консоли Firebase](https://console.firebase.google.com/) перейдите в **Project Settings**.
2. Внизу страницы найдите раздел **Your apps** -> **Web App** -> **SDK setup** -> **Config**.
3. Вам понадобятся значения: `apiKey`, `authDomain`, `projectId`, `appId`.

### Шаг 2: Настройка в Timeweb Cloud
1. Создайте проект «Приложение из Docker-compose».
2. Подключите ваш GitHub репозиторий: `https://github.com/Aleksey29212/Ru55darts.git`.
3. Перейдите во вкладку **«Переменные окружения»** и добавьте следующие ключи:
   - `NEXT_PUBLIC_FIREBASE_API_KEY` — (ваш apiKey)
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` — (ваш authDomain)
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID` — (ваш projectId)
   - `NEXT_PUBLIC_FIREBASE_APP_ID` — (ваш appId)
   - `NEXT_PUBLIC_ADMIN_PASSWORD` — (любой ваш пароль для входа в админку)

### Шаг 3: Запуск
После сохранения переменных и запуска сборки, Timeweb Cloud автоматически развернет контейнер.
- **Команда сборки**: `docker-compose build`
- **Команда запуска**: `docker-compose up -d`
- **Внутренний порт**: `3000`

---
Разработано для профессионального сообщества. Аудит математики и Docker-конфигурации пройден (v2.8 Stable).
