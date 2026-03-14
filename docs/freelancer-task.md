
# Техническое задание: Деплой платформы DartBrig Pro

## Обзор проекта
**DartBrig Pro** — это современная система управления рейтингами дартс-турниров. 
**Стек технологий:**
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Database/Auth:** Firebase (Firestore, Authentication)
- **UI:** ShadCN, Tailwind CSS, Lucide Icons
- **Deployment:** Docker (standalone mode)

## Задача
Необходимо развернуть приложение на хостинге (Vercel или VPS через Docker).

## Шаги по установке:
1. **GitHub:** Код находится в репозитории. Необходимо настроить автоматический деплой (CI/CD).
2. **Firebase:**
   - Создать проект в консоли Firebase.
   - Включить Firestore Database (регион eur3 или us-central1).
   - Включить Authentication (метод "Anonymous").
   - Применить правила безопасности из файла `firestore.rules`.
3. **Environment Variables:** Настроить следующие переменные в панели хостинга:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_ADMIN_PASSWORD` (пароль для доступа к `/gate`)
   - `GOOGLE_GENAI_API_KEY` (для работы ИИ-студии стилей)
4. **Сборка:**
   - Приложение оптимизировано под режим `output: 'standalone'`.
   - Использовать `docker-compose.yml` для быстрого развертывания на VPS.

## Требования к результату:
- Сайт доступен по внешному URL.
- Работает импорт турниров с dartsbase.ru.
- Работает авторизация администратора (через страницу `/gate`).
- Аналитика посещений корректно пишется в Firestore.
