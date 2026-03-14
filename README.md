# DartBrig Pro - Система управления рейтингами (v2.8 Stable)

Современная платформа для автоматизации дартс-турниров. Построена на стеке **Next.js 15**, **Tailwind CSS** и **Firebase**.

## 🛠 Технический стек
- **Framework**: Next.js 15 (App Router)
- **Backend**: Firebase Firestore (Облачная БД)
- **Auth**: Firebase Auth (Anonymous)
- **Deployment**: Docker / Firebase App Hosting

## 🚀 Как отправить код в GitHub (Инструкция по токену)

GitHub больше не принимает обычные пароли. Вам нужен **Personal Access Token (PAT)**.

### 1. Получение токена:
1. Перейдите по ссылке: [GitHub Token Settings (Classic)](https://github.com/settings/tokens).
2. Нажмите **Generate new token (classic)**.
3. В поле **Note** укажите `DeployToken`.
4. В списке галочек выберите только **repo** (полный доступ к репозиториям).
5. Нажмите **Generate token** внизу страницы.
6. **Скопируйте токен** (например: `ghp_abc123...`).

### 2. Привязка токена к проекту:
Выполните эту команду в терминале (подставьте ваш токен):
```bash
git remote set-url origin https://ВАШ_ТОКЕН@github.com/Aleksey29212/Ru55darts.git
```

### 3. Запуск деплоя:
```bash
npm run deploy:github
```

---
Разработано для профессионального сообщества. Аудит математики и Docker-конфигурации пройден.
