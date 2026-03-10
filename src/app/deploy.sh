#!/bin/bash

# Скрипт для радикального исправления ошибок Git и деплоя (v2.2)
# Специально для устранения ошибок "object file is empty"

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================${NC}"
echo -e "${GREEN}   DartBrig Pro: GitHub Deployment     ${NC}"
echo -e "${BLUE}=======================================${NC}"

# 1. Проверка на критическое повреждение Git
# Если git status выдает ошибку о пустых объектах или fatal
CHECK_GIT=$(git status 2>&1)
if [[ $CHECK_GIT == *"empty"* ]] || [[ $CHECK_GIT == *"fatal"* ]] || [ ! -d .git ]; then
  echo -e "${RED}⚠️ Обнаружено критическое повреждение локальной базы Git.${NC}"
  echo -e "${YELLOW}🔄 Выполняется принудительная переинициализация...${NC}"
  
  # Пытаемся сохранить URL удаленного репозитория
  REMOTE_URL=$(git remote get-url origin 2>/dev/null)
  if [ -z "$REMOTE_URL" ]; then
    # Используем URL из логов, если не удалось получить автоматически
    REMOTE_URL="https://github.com/Aleksey29212/Ru55darts.git"
  fi

  # Полная очистка
  rm -rf .git
  git init
  git branch -M main
  git remote add origin "$REMOTE_URL"
  echo -e "${GREEN}✅ Локальный репозиторий очищен и пересоздан.${NC}"
else
  echo -e "${YELLOW}ℹ️ Локальный репозиторий в норме.${NC}"
  REMOTE_URL=$(git remote get-url origin)
fi

echo -e "${BLUE}ℹ️ Удаленный репозиторий: ${WHITE}$REMOTE_URL${NC}"

# 2. Индексация и коммит
echo -e "${GREEN}📦 Индексация файлов...${NC}"
git add .

echo -e "${GREEN}💾 Создание чистого коммита...${NC}"
git commit -m "Critical Fix: Re-initialize repository and update DartBrig Pro to latest version"

# 3. Отправка кода
echo -e "${YELLOW}📤 Отправка в GitHub (Force Push)...${NC}"
echo -e "${RED}ВНИМАНИЕ: Если GitHub запросит пароль, используйте Personal Access Token!${NC}"

if git push -u origin main --force; then
  echo -e "\n${GREEN}🎉 ПРОЕКТ УСПЕШНО ОТПРАВЛЕН В GITHUB!${NC}"
else
  echo -e "\n${RED}❌ Ошибка доступа. Проверьте настройки Personal Access Token на GitHub.${NC}"
  echo -e "${YELLOW}Инструкция: GitHub -> Settings -> Developer Settings -> Tokens (classic)${NC}"
fi
