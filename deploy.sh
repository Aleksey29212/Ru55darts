#!/bin/bash

# Скрипт для развертывания проекта на GitHub (Ru55darts Edition)
# Версия с авто-восстановлением (Smart Recovery v2.0)

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

REPO_URL="https://github.com/Aleksey29212/Ru55darts.git"

echo -e "${GREEN}Начинаем процесс развертывания на GitHub...${NC}"

# Проверка на повреждение Git
if [ -d .git ]; then
  git status >/dev/null 2>&1
  if [ $? -ne 0 ]; then
    echo -e "${RED}Обнаружено повреждение локального Git-репозитория.${NC}"
    echo -e "${YELLOW}Выполняем принудительную переинициализацию...${NC}"
    rm -rf .git
  fi
fi

# Инициализация нового репозитория, если его нет
if [ ! -d .git ]; then
  echo -e "${GREEN}Инициализация нового Git-репозитория...${NC}"
  git init
  if [ $? -ne 0 ]; then
    echo "Ошибка при инициализации Git. Выход."
    exit 1
  fi
fi

# Настройка удаленного репозитория
git remote remove origin >/dev/null 2>&1
git remote add origin "$REPO_URL"
echo -e "${BLUE}Удаленный репозиторий настроен: $REPO_URL${NC}"

# Настройка ветки
git branch -M main

# Добавление файлов
echo -e "${GREEN}Добавление всех файлов в индекс...${NC}"
git add .

# Создание коммита
echo -e "${GREEN}Создание коммита...${NC}"
git commit -m "Deployment Update: $(date +'%Y-%m-%d %H:%M:%S')" --allow-empty

# Отправка изменений
echo -e "${YELLOW}Отправка изменений в ветку 'main' на GitHub (Force Push)...${NC}"
git push -u origin main --force

if [ $? -ne 0 ]; then
  echo -e "${RED}Ошибка при отправке на GitHub.${NC}"
  echo "Проверьте:"
  echo "1. Наличие прав доступа к репозиторию Aleksey29212/Ru55darts."
  echo "2. Наличие интернета и доступ к github.com."
  exit 1
fi

echo -e "${GREEN}Проект успешно отправлен в Ru55darts!${NC}"
echo -e "URL: ${BLUE}$REPO_URL${NC}"
