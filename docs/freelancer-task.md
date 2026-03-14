
# Техническое задание: Деплой платформы DartBrig Pro

## Обзор проекта
**DartBrig Pro** — это современная система управления рейтингами дартс-турниров. 
**Стек технологий:**
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Database/Auth:** Firebase (Firestore, Authentication)
- **UI:** ShadCN, Tailwind CSS, Russo One Font
- **Deployment:** Docker (standalone mode)

## Задача
Необходимо развернуть приложение на хостинге (Vercel, Timeweb Cloud или любой VPS через Docker).

## Ссылка на репозиторий
`https://github.com/Aleksey29212/Ru55darts.git`

## Шаги по установке:
1. **GitHub:** Код находится в репозитории. Настроить CI/CD для автоматической сборки.
2. **Firebase:**
   - Создать проект в консоли Firebase.
   - Включить Firestore Database.
   - Включить Authentication (Anonymous).
   - Применить правила безопасности из `firestore.rules`.
3. **Environment Variables:** Настроить в панели хостинга:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_ADMIN_PASSWORD` (пароль для `/gate`)
   - `GOOGLE_GENAI_API_KEY` (для ИИ-студии стилей)
4. **Сборка:**
   - Приложение использует `output: 'standalone'`.
   - Использовать `docker-compose.yml` для VPS.

## Требования к результату:
- Сайт доступен по внешному URL.
- Работает импорт турниров с dartsbase.ru.
- Аналитика посещений пишется в Firestore.
- Интерфейс администратора читается полностью без обрезанных заголовков.
