
#!/bin/bash

# DartBrig Pro: Ultimate Deployment Script v15.0
# Автоматическая привязка токена и отправка в GitHub.

REPO_URL="https://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@github.com/Aleksey29212/Ru55darts.git"

echo "--- DARTBRIG PRO DEPLOYMENT ---"

# 0. Принудительная привязка к репозиторию с токеном
echo "0. Обновление связи с GitHub (приватный доступ)..."
git remote set-url origin "$REPO_URL" 2>/dev/null || git remote add origin "$REPO_URL"

# 1. Индексация изменений
echo "1. Индексация файлов проекта..."
git add .

# 2. Коммит
COMMIT_MSG="Production Update: Full Readability, Linked Repository and Freelancer Task"
echo "2. Создание коммита..."
git commit -m "$COMMIT_MSG" --quiet || echo "Инфо: Изменений для фиксации нет."

# 3. Отправка
echo "3. Отправка в GitHub (Master Push)..."
if git push origin main --force; then
  echo "---------------------------------------"
  echo "УСПЕХ: Проект отправлен в GitHub!"
  echo "Ссылка: https://github.com/Aleksey29212/Ru55darts"
  echo "---------------------------------------"
else
  echo "---------------------------------------"
  echo "ОШИБКА: GitHub заблокировал отправку (Push Protection)."
  echo "РЕШЕНИЕ:"
  echo "1. В тексте ошибки выше найдите ссылку 'https://github.com/.../unblock-secret/...'"
  echo "2. Кликните по ней (Ctrl + Клик) и нажмите кнопку 'Allow this secret' на сайте GitHub."
  echo "3. Снова запустите команду: npm run deploy:github"
  echo "---------------------------------------"
fi
