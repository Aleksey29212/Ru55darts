# DartBrig Pro - Система управления рейтингами (v2.8 Stable)

Современная платформа для автоматизации дартс-турниров. Построена на стеке **Next.js 15**, **Tailwind CSS** и **Firebase**.

## 🛠 Технический стек
- **Framework**: Next.js 15 (App Router)
- **Backend**: Firebase Firestore (Облачная БД)
- **Auth**: Firebase Auth (Anonymous)
- **Deployment**: Docker / Firebase App Hosting

## 🚀 Как отправить код в GitHub (Деплой)

Если при запуске `npm run deploy:github` вы получаете ошибку авторизации:

1. **Получите токен (PAT)**:
   - Перейдите в [GitHub Token Settings](https://github.com/settings/tokens).
   - Нажмите **Generate new token (classic)**.
   - Выберите срок действия и отметьте галочку **repo**.
   - Скопируйте полученный код (например: `ghp_xxxxxxx`).

2. **Привяжите токен к проекту**:
   Выполните в терминале команду (замените `ВАШ_ТОКЕН` на скопированный код):
   ```bash
   git remote set-url origin https://ВАШ_ТОКЕН@github.com/Aleksey29212/Ru55darts.git
   ```

3. **Запустите деплой снова**:
   ```bash
   npm run deploy:github
   ```

## 🚀 Варианты хостинга

### Вариант А: Firebase App Hosting (Рекомендуется)
1. Зайдите в [Консоль Firebase](https://console.firebase.google.com/).
2. Раздел **Build** -> **App Hosting**.
3. Подключите ваш репозиторий GitHub.

### Вариант Б: Timeweb Cloud (Docker-compose)
1. Создайте проект **«Приложение из Docker-compose»**.
2. Добавьте переменные окружения:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_ADMIN_PASSWORD` (ваш новый пароль для входа)

---
Разработано для профессионального сообщества. Аудит математики и Docker-конфигурации пройден.
