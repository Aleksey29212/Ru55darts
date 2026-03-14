
#!/bin/bash

# DartBrig Pro: Ultimate Deployment Script v12.0
# Автоматическая отправка проекта в GitHub.

echo "--- DARTBRIG PRO DEPLOYMENT ---"

# 0. Привязка к репозиторию
echo "0. Настройка связи с GitHub..."
git remote set-url origin https://github.com/Aleksey29212/Ru55darts.git 2>/dev/null || git remote add origin https://github.com/Aleksey29212/Ru55darts.git

# 1. Индексация изменений
echo "1. Индексация файлов проекта..."
git add .

# 2. Коммит
COMMIT_MSG="Production Update: Full Readability and Linked Repository"
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
  echo "ОШИБКА: GitHub отклонил запрос (Push Protection или Credentials)."
  echo "РЕШЕНИЕ:"
  echo "1. Если видите ссылку 'unblock-secret' выше - кликните по ней и нажмите 'Allow this secret'."
  echo "2. Если ошибка 'Invalid credentials', выполните ОДИН РАЗ команду с вашим токеном:"
  echo "git remote set-url origin https://ВАШ_ТОКЕН@github.com/Aleksey29212/Ru55darts.git"
  echo "3. Снова запустите: npm run deploy:github"
  echo "---------------------------------------"
fi
