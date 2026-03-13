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
echo -e "${WHITE}• Оптимизирован отклик интерфейса (Snappy UI)${NC}"
echo -e "${WHITE}• Подготовлен конфиг для Timeweb${NC}"

git add .

# 3. Коммит
echo -e "${GREEN}💾 Сохранение стабильной сборки...${NC}"
git commit -m "Stable Build v2.8: Final UI polish, naming fix and deployment readiness" --quiet

# 4. Инструкция для пользователя
echo -e "\n${BLUE}=======================================${NC}"
echo -e "${GREEN}✅ КОД ГОТОВ К ОТПРАВКЕ!${NC}"
echo -e "${BLUE}=======================================${NC}"
echo -e "${YELLOW}Следующие шаги:${NC}"
echo -e "1. Убедитесь, что у вас добавлен удаленный репозиторий:"
echo -e "   ${WHITE}git remote add origin https://github.com/ВАШ_ЛОГИН/ВАШ_РЕПО.git${NC}"
echo -e "2. Отправьте код командой:"
echo -e "   ${WHITE}git push -u origin main --force${NC}"
echo -e "\n${RED}Затем просто подключите этот GitHub репозиторий к Timeweb!${NC}"
