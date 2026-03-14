
#!/bin/bash

# DartBrig Pro: Ultimate Deployment Script v11.0
# Автоматическая отправка проекта в GitHub.

echo "--- DARTBRIG PRO DEPLOYMENT ---"

# 1. Индексация изменений
echo "1. Индексация файлов проекта..."
git add .

# 2. Коммит
COMMIT_MSG="Production Update: Full Readability and Freelancer Task"
echo "2. Создание коммита..."
git commit -m "$COMMIT_MSG" --quiet || echo "Инфо: Изменений для фиксации нет."

# 3. Отправка
echo "3. Отправка в GitHub (Master Push)..."
if git push origin main --force; then
  echo "---------------------------------------"
  echo "УСПЕХ: Проект отправлен в GitHub!"
  echo "---------------------------------------"
else
  echo "---------------------------------------"
  echo "ОШИБКА: GitHub заблокировал отправку (Push Protection) или отсутствует привязка."
  echo "РЕШЕНИЕ:"
  echo "1. Если видите ссылку 'unblock-secret' выше - кликните по ней и нажмите 'Allow this secret'."
  echo "2. Если репозиторий новый, выполните один раз: git remote set-url origin ВАША_ССЫЛКА_С_ТОКЕНОМ"
  echo "3. Снова запустите: npm run deploy:github"
  echo "---------------------------------------"
fi
