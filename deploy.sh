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

echo -e "${BLUE}=======================================${NC}"
echo -e "${GREEN}   DartBrig Pro: Production Ready      ${NC}"
echo -e "${BLUE}=======================================${NC}"

# 1. Проверка Git
if [ ! -d .git ]; then
  echo -e "${YELLOW}🔄 Инициализация нового репозитория...${NC}"
  git init
  git branch -M main
fi

# 2. Добавление изменений
echo -e "${GREEN}📦 Подготовка файлов DartBrig Pro v2.8...${NC}"
echo -e "${WHITE}• Исправлена читаемость цифр во всех 10 шаблонах${NC}"
echo -e "${WHITE}• Обновлена терминология: AVG, 180, Hi-Out${NC}"
echo -e "${WHITE}• Исправлена математика множителей и ТОП-16${NC}"
echo -e "${WHITE}• Оптимизирован отклик интерфейса (Snappy UI)${NC}"
echo -e "${WHITE}• Подготовлен конфиг для Timeweb${NC}"

git add .

# 3. Коммит
echo -e "${GREEN}💾 Сохранение стабильной сборки...${NC}"
git commit -m "Stable Build v2.8: Final UI polish, math fix and deployment readiness" --quiet

# 4. Проверка удаленного репозитория
REMOTE_URL=$(git remote get-url origin 2>/dev/null)

if [ -z "$REMOTE_URL" ]; then
  echo -e "\n${RED}⚠️ Удаленный репозиторий не подключен!${NC}"
  echo -e "${YELLOW}Введите ссылку на ваш GitHub репозиторий:${NC}"
  read -p "URL (https://github.com/...): " USER_URL
  if [ ! -z "$USER_URL" ]; then
    git remote add origin "$USER_URL"
    echo -e "${GREEN}✅ Репозиторий подключен.${NC}"
  else
    echo -e "${RED}❌ Отмена. Адрес не введен.${NC}"
    exit 1
  fi
fi

# 5. Отправка
echo -e "${YELLOW}📤 Отправка кода в GitHub...${NC}"
if git push -u origin main --force; then
  echo -e "\n${BLUE}=======================================${NC}"
  echo -e "${GREEN}✅ КОД УСПЕШНО ОТПРАВЛЕН В GITHUB!${NC}"
  echo -e "${BLUE}=======================================${NC}"
  echo -e "\n${YELLOW}Следующий шаг:${NC}"
  echo -e "Просто подключите этот GitHub репозиторий к вашему хостингу (Timeweb/Vercel)."
else
  echo -e "\n${RED}❌ Ошибка отправки. Проверьте соединение и права доступа.${NC}"
fi
