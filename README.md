# DartBrig Pro - Система управления рейтингами (v2.8 Stable)

Современная платформа для автоматизации дартс-турниров. Построена на стеке **Next.js 15**, **Tailwind CSS** и **Firebase**.

## 🛠 Технический стек
- **Framework**: Next.js 15 (App Router)
- **Backend**: Firebase Firestore (Облачная БД)
- **Auth**: Firebase Auth (Anonymous)
- **Deployment**: Docker / Node.js Standalone

## 🚀 Инструкция по деплою (Timeweb Cloud / любая Docker-платформа)

### Шаг 1: Отправка в GitHub
1. Выполните команду: `npm run deploy:github`
2. Весь код со всеми исправлениями (математика, Docker-файлы, UI) будет отправлен в ваш репозиторий `Aleksey29212/Ru55darts.git`.

### Шаг 2: Настройка в Timeweb Cloud
1. Создайте проект «Приложение из Docker-compose» или «Node.js приложение».
2. Подключите ваш GitHub репозиторий.
3. В разделе **«Переменные окружения»** добавьте:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=ваш_ключ
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ваш_домен
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=ваш_id_проекта
   NEXT_PUBLIC_FIREBASE_APP_ID=ваш_id_приложения
   NEXT_PUBLIC_ADMIN_PASSWORD=1234
   ```

### Шаг 3: Команды запуска (для техподдержки)
Если система запрашивает команды вручную:
- **Сборка**: `docker-compose build`
- **Запуск**: `docker-compose up -d`
- **Порт**: `3000`

---
Разработано для профессионального сообщества. Аудит математики и Docker-конфигурации пройден (v2.8 Stable).
