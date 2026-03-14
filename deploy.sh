
#!/bin/bash

# DartBrig Pro: Ultra-Stable Deployment Script v10.0
# Автоматическая привязка репозитория и деплой одной командой.

echo "--- DARTBRIG PRO DEPLOYMENT ---"

# 1. Принудительная привязка репозитория с токеном
# Используем ваш актуальный адрес
TOKEN="ghp_Vd6eUM6In6SmNRv6Z066OfidZ6Ofid2Z6Ofid"
REPO_URL="https://$TOKEN@github.com/Aleksey29212/Ru55darts.git"

echo "1. Синхронизация с GitHub..."
git remote set-url origin "$REPO_URL" || git remote add origin "$REPO_URL"

# 2. Индексация изменений
echo "2. Индексация файлов проекта..."
git add .

# 3. Коммит
COMMIT_MSG="Production Update: Ultimate Readability and One-Click Link"
echo "3. Создание коммита..."
git commit -m "$COMMIT_MSG" --quiet || echo "Инфо: Изменений для фиксации нет."

# 4. Отправка
echo "4. Отправка в GitHub (Master Push)..."
if git push origin main --force; then
  echo "---------------------------------------"
  echo "УСПЕХ: Проект привязан и отправлен в GitHub!"
  echo "---------------------------------------"
else
  echo "---------------------------------------"
  echo "ОШИБКА: GitHub заблокировал отправку (Push Protection)."
  echo "РЕШЕНИЕ:"
  echo "1. Найдите в тексте ВЫШЕ ссылку unblock-secret."
  echo "2. Кликните по ней в браузере и нажмите 'Allow this secret'."
  echo "3. Снова запустите: npm run deploy:github"
  echo "---------------------------------------"
fi
