# DartBrig Pro - Система управления рейтингами (v2.6)

Современная платформа для автоматизации дартс-турниров, агрегации статистики и создания премиальных карточек игроков.

## 🚀 Деплой на Timeweb / Vercel / Firebase

Для успешной работы приложения на хостинге необходимо настроить **Переменные окружения (Environment Variables)**:

1. `NEXT_PUBLIC_ADMIN_PASSWORD` — пароль для доступа к панели `/admin`.
2. `NEXT_PUBLIC_FIREBASE_API_KEY` — API ключ из настроек Firebase.
3. `NEXT_PUBLIC_FIREBASE_PROJECT_ID` — ID вашего проекта Firebase.
4. `NEXT_PUBLIC_FIREBASE_APP_ID` — App ID вашего веб-приложения Firebase.
5. `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` — Домен авторизации (обычно `project-id.firebaseapp.com`).
6. `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` — ID отправителя сообщений.

### Важно в консоли Firebase:
- Включите **Anonymous Authentication** в разделе Authentication.
- Создайте **Cloud Firestore** в разделе Firestore Database.

## 🛠️ Основные функции
- **Импорт турниров**: Автоматический парсинг с dartsbase.ru по ID.
- **Лиги как страницы**: Каждая лига (Глобальная, Омск и др.) загружается по требованию.
- **Личные карточки**: Подробная статистика с 10+ параметрами и пояснениями.
- **Студия стилей**: Генерация тем оформления через ИИ.

---
Разработано специально для DartBrig. Версия ядра: 2.6.
