#!/bin/bash

# Скрипт для радикального исправления ошибок Git и деплоя (v2.6 Master)
# Специально для автоматизации процесса "в один клик"

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
WHITE='\033[1;37m'
NC='\033[0m'

echo -e "${BLUE}=======================================${NC}"
echo -e "${GREEN}   DartBrig Pro: Auto-Deploy Tool      ${NC}"
echo -e "${BLUE}=======================================${NC}"

# 1. Проверка на критическое повреждение Git
CHECK_GIT=$(git status 2>&1)
if [[ $CHECK_GIT == *"empty"* ]] || [[ $CHECK_GIT == *"fatal"* ]] || [ ! -d .git ]; then
  echo -e "${RED}⚠️ Обнаружено повреждение Git или новый проект.${NC}"
  echo -e "${YELLOW}🔄 Выполняется автоматическая инициализация...${NC}"
  
  # Пытаемся сохранить URL удаленного репозитория
  REMOTE_URL=$(git remote get-url origin 2>/dev/null)
  if [ -z "$REMOTE_URL" ]; then
    # Если не удалось найти, используем ваш репозиторий по умолчанию
    REMOTE_URL="https://github.com/Aleksey29212/Ru55darts.git"
  fi

  # Полная очистка и пересоздание
  rm -rf .git
  git init
  git branch -M main
  git remote add origin "$REMOTE_URL"
  echo -e "${GREEN}✅ Репозиторий успешно пересоздан.${NC}"
else
  echo -e "${YELLOW}ℹ️ Локальный репозиторий в норме.${NC}"
  REMOTE_URL=$(git remote get-url origin)
fi

echo -e "${BLUE}ℹ️ Цель: ${WHITE}$REMOTE_URL${NC}"

# 2. Индексация и коммит
echo -e "${GREEN}📦 Подготовка файлов к отправке...${NC}"
git add .

echo -e "${GREEN}💾 Сохранение изменений...${NC}"
git commit -m "Auto-Update: Stable build for deployment" --quiet

# 3. Отправка кода
echo -e "${YELLOW}📤 Отправка в GitHub (Принудительно)...${NC}"
echo -e "${RED}ВНИМАНИЕ: Если GitHub запросит пароль, используйте Personal Access Token!${NC}"

if git push -u origin main --force; then
  echo -e "\n${GREEN}🎉 ПРОЕКТ УСПЕШНО ОТПРАВЛЕН В GITHUB!${NC}"
  echo -e "${YELLOW}👉 Теперь ваш сайт на хостинге обновится автоматически.${NC}"
else
  echo -e "\n${RED}❌ Ошибка доступа. Возможно, нужно обновить Personal Access Token на GitHub.${NC}"
  echo -e "${YELLOW}Инструкция: Настройки GitHub -> Developer Settings -> Tokens (classic)${NC}"
fi
