# Техническое задание: Деплой платформы DartBrig Pro

## Обзор проекта
**DartBrig Pro** — это система управления рейтингами дартс-турниров. 
**Стек технологий:**
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Database/Auth:** Firebase (Firestore, Authentication)
- **UI:** ShadCN, Tailwind CSS, Lucide Icons
- **AI:** Genkit (Google Gemini)
- **Deployment:** Docker (standalone mode)

## Задача
Необходимо развернуть приложение на хостинге (рекомендуется Vercel или VPS через Docker).

## Шаги по установке:
1. **GitHub:** Код уже находится в репозитории. Необходимо настроить CI/CD.
2. **Firebase:**
   - Создать проект в консоли Firebase.
   - Включить Firestore Database.
   - Включить Authentication (метод "Anonymous").
   - Применить правила безопасности из файла `firestore.rules`.
3. **Environment Variables:** Настроить следующие переменные в панели хостинга:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_ADMIN_PASSWORD` (пароль для входа в `/gate`)
   - `GOOGLE_GENAI_API_KEY` (для работы ИИ-студии стилей)
4. **Сборка:**
   - Приложение оптимизировано под режим `output: 'standalone'`.
   - Использовать `docker-compose.yml` для развертывания на VPS.

## Требования к результату:
- Сайт доступен по внешнему URL.
- Работает импорт турниров с dartsbase.ru (проверить в админке).
- Работает авторизация администратора (через страницу `/gate`).
- Аналитика посещений корректно пишется в Firestore.

**Репозиторий:** https://github.com/Aleksey29212/Ru55darts.git
