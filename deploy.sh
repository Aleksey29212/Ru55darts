#!/bin/bash

# Скрипт для радикальной подготовки и деплоя DartBrig Pro v2.8 Stable
# Специально для автоматизации процесса "в один клик" из среды разработки в GitHub

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
WHITE='\033[1;37m'
NC='\033[0m'

TARGET_REPO="https://github.com/Aleksey29212/Ru55darts.git"

echo -e "${BLUE}=======================================${NC}"
echo -e "${GREEN}   DartBrig Pro: Production Ready      ${NC}"
echo -e "${BLUE}=======================================${NC}"

# 1. Проверка и лечение Git
if [ ! -d .git ]; then
  echo -e "${YELLOW}🔄 Инициализация нового репозитория...${NC}"
  git init
  git branch -M main
fi

# Проверка на пустые объекты (лечение поврежденной базы)
CHECK_GIT=$(git status 2>&1)
if [[ $CHECK_GIT == *"empty"* ]] || [[ $CHECK_GIT == *"fatal"* ]]; then
  echo -e "${RED}⚠️ Обнаружена ошибка Git. Выполняю глубокую очистку...${NC}"
  rm -rf .git
  git init
  git branch -M main
fi

# 2. Настройка удаленного репозитория
git remote remove origin 2>/dev/null
git remote add origin "$TARGET_REPO"
echo -e "${GREEN}✅ Репозиторий подключен: ${WHITE}$TARGET_REPO${NC}"

# 3. Подготовка коммита
echo -e "${GREEN}📦 Индексация файлов DartBrig Pro v2.8 Stable...${NC}"
echo -e "${WHITE}• Оптимизация 3-значных чисел (100+)${NC}"
echo -e "${WHITE}• Исправление множителей (Омск: 1.0 победа)${NC}"
echo -e "${WHITE}• Настройка Timeweb Cloud (Standalone)${NC}"
echo -e "${WHITE}• Мобильный Регламент (4 колонки)${NC}"

git add .

# 4. Сохранение
git commit -m "Stable Build v2.8: Final UI/Math Polish and Timeweb Readiness" --quiet || echo "Изменений для фиксации нет."

# 5. Принудительная отправка
echo -e "${YELLOW}📤 Отправка в GitHub (Master Push)...${NC}"
if git push -u origin main --force; then
  echo -e "\n${BLUE}=======================================${NC}"
  echo -e "${GREEN}✅ ПРОЕКТ УСПЕШНО ЗАГРУЖЕН В GITHUB!${NC}"
  echo -e "${BLUE}=======================================${NC}"
  echo -e "\n${YELLOW}Следующий шаг:${NC}"
  echo -e "Зайдите в Timeweb Cloud и создайте проект из этого репозитория."
else
  echo -e "\n${RED}❌ Ошибка отправки. Проверьте ваш Personal Access Token на GitHub.${NC}"
fi
