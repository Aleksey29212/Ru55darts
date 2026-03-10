# DartBrig Pro - Система управления рейтингами (v2.6)

Современная платформа для автоматизации дартс-турниров, агрегации статистики и создания премиальных карточек игроков.

## 🚀 Деплой на Timeweb (Cloud Server / VPS)

Если вы используете сервер **Wise Crane** (Ubuntu):

1. **Доступ**: Зайдите во вкладку "Доступ" в панели Timeweb, чтобы получить root-пароль.
2. **SSH**: Подключитесь к серверу через терминал: `ssh root@<ваш_ip>`.
3. **Подготовка**: Установите Node.js 20+ и Git.
4. **Конфигурация**: 
   - Создайте файл `.env.local` в корне проекта.
   - Скопируйте туда ключи из Firebase Console (Project Settings).
   - Список ключей см. ниже.
5. **Запуск**:
   ```bash
   npm install
   npm run build
   npm start
   ```

## 🛠️ Переменные окружения (ОБЯЗАТЕЛЬНО)

Эти ключи должны быть прописаны в `.env.local` или в панели управления хостинга:

1. `NEXT_PUBLIC_ADMIN_PASSWORD` — ваш секретный пароль для доступа к админ-панели `/admin`.
2. `NEXT_PUBLIC_FIREBASE_API_KEY` — API ключ из настроек вашего проекта Firebase.
3. `NEXT_PUBLIC_FIREBASE_PROJECT_ID` — ID вашего проекта Firebase.
4. `NEXT_PUBLIC_FIREBASE_APP_ID` — App ID веб-приложения Firebase.
5. `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` — Домен авторизации (обычно `project-id.firebaseapp.com`).
6. `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` — ID отправителя сообщений.

### Важно в консоли Firebase:
- В разделе **Authentication** включите метод входа **Anonymous** (Анонимный).
- В разделе **Firestore Database** создайте базу данных (рекомендуемый регион: `europe-west`).

---
Разработано специально для DartBrig. Версия ядра: 2.6.
