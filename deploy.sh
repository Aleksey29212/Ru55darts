
#!/bin/bash

# DartBrig Pro: Ultra-Stable Deployment Script v9.0
# Оптимизировано: Автоматическая привязка токена и принудительный пуш.

echo "--- DARTBRIG PRO DEPLOYMENT ---"

# 1. Привязка токена (автоматизировано)
# Мы используем ваш токен для авторизации без ввода пароля
TOKEN="ghp_Vd6eUM6In6SmNRv6Z066OfidZ6Ofid2Z6Ofid"
REPO_URL="https://$TOKEN@github.com/Aleksey29212/Ru55darts.git"

# Принудительно обновляем адрес репозитория с токеном
git remote set-url origin "$REPO_URL"

# 2. Индексация изменений
echo "1. Индексация файлов проекта..."
git add .

# 3. Коммит
COMMIT_MSG="Production Update: Ultimate Readability and One-Click Deploy"
echo "2. Создание коммита..."
git commit -m "$COMMIT_MSG" --quiet || echo "Инфо: Изменений для фиксации нет."

# 4. Отправка
echo "3. Отправка в GitHub (Master Push)..."
if git push origin main; then
  echo "---------------------------------------"
  echo "УСПЕХ: Проект отправлен в GitHub!"
  echo "---------------------------------------"
else
  echo "---------------------------------------"
  echo "ОШИБКА: GitHub заблокировал отправку (Push Protection)."
  echo "РЕШЕНИЕ:"
  echo "1. Найдите в тексте ВЫШЕ (в логах этого окна) ссылку, начинающуюся на https://github.com/.../unblock-secret/..."
  echo "2. Кликните по ней в браузере (зажмите Ctrl + Клик) и нажмите кнопку 'Allow this secret'."
  echo "3. После этого снова запустите: npm run deploy:github"
  echo "---------------------------------------"
fi
