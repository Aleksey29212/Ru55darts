#!/bin/bash

# DartBrig Pro: Ultra-Stable Deployment Script v4.0
# Это упрощенная версия для предотвращения зависания терминала.

echo "--- DARTBRIG PRO DEPLOYMENT ---"

# 1. Проверка изменений
echo "1. Индексация изменений..."
git add .

# 2. Коммит
COMMIT_MSG="Production Update: UI Readability and Deploy Stability"
git commit -m "$COMMIT_MSG" --quiet || echo "Инфо: Изменений для фиксации нет."

# 3. Отправка
echo "2. Отправка в GitHub..."
# Принудительно отключаем помощники паролей и пушим в ветку main
if git push origin main; then
  echo "---------------------------------------"
  echo "УСПЕХ: Проект отправлен в GitHub!"
  echo "---------------------------------------"
else
  echo "---------------------------------------"
  echo "ОШИБКА: GitHub отклонил доступ."
  echo "Убедитесь, что вы выполнили команду привязки токена из README.md"
  echo "---------------------------------------"
fi
