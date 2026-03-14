#!/bin/bash

# DartBrig Pro: Clean Deployment Script v18.0
# Скрипт без токена внутри для обхода GitHub Push Protection.

echo "--- DARTBRIG PRO DEPLOYMENT ---"

# 1. Индексация изменений
echo "1. Индексация файлов проекта..."
git add .

# 2. Коммит
COMMIT_MSG="Production Update: Clean Auth and Maximum Readability"
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
  echo "ОШИБКА: Отправка не удалась."
  echo "Если вы видите 'Push Protection', значит в коде все еще остался токен."
  echo "Если вы видите 'Authentication failed', выполните команду привязки токена из чата."
  echo "---------------------------------------"
fi
