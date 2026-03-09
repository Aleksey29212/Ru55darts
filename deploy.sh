#!/bin/bash

# Скрипт для развертывания проекта на GitHub (Ru55darts Edition)
# Версия с авто-восстановлением (Smart Recovery v3.0)

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

REPO_URL="https://github.com/Aleksey29212/Ru55darts.git"

echo -e "${GREEN}Начинаем процесс развертывания на GitHub...${NC}"

# Функция для полной переинициализации Git
reinit_git() {
  echo -e "${YELLOW}Выполняем принудительную переинициализацию репозитория...${NC}"
  rm -rf .git
  git init
  git remote add origin "$REPO_URL"
  git branch -M main
}

# Проверка на повреждение Git
if [ -d .git ]; then
  # Пытаемся проверить статус, если ошибка - переинициализируем
  git status >/dev/null 2>&1
  if [ $? -ne 0 ]; then
    echo -e "${RED}Обнаружено повреждение локального Git-репозитория.${NC}"
    reinit_git
  fi
else
  git init
  git remote add origin "$REPO_URL"
  git branch -M main
fi

# Настройка удаленного репозитория (на случай если URL изменился)
git remote set-url origin "$REPO_URL" 2>/dev/null || git remote add origin "$REPO_URL"
echo -e "${BLUE}Удаленный репозиторий: $REPO_URL${NC}"

# Добавление файлов
echo -e "${GREEN}Добавление файлов...${NC}"
git add .

# Создание коммита
echo -e "${GREEN}Создание коммита...${NC}"
git commit -m "Full Update with Docker support: $(date +'%Y-%m-%d %H:%M:%S')" --allow-empty

# Отправка изменений
echo -e "${YELLOW}Отправка изменений (Force Push)...${NC}"
git push -u origin main --force

if [ $? -ne 0 ]; then
  echo -e "${RED}Ошибка при отправке на GitHub.${NC}"
  echo "Попробуйте вручную проверить доступ к интернету и права доступа к Aleksey29212/Ru55darts."
  exit 1
fi

echo -e "${GREEN}ПРОЕКТ УСПЕШНО ОТПРАВЛЕН!${NC}"
echo -e "URL: ${BLUE}$REPO_URL${NC}"
