#!/bin/bash

# DartBrig Pro: Production Deployment Script (v3.7 Secure)
# БЕЗОПАСНАЯ ВЕРСИЯ: Без вшитых токенов (защита от GitHub Push Protection)

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
WHITE='\033[1;37m'
NC='\033[0m'

echo -e "${BLUE}=======================================${NC}"
echo -e "${GREEN}   DartBrig Pro: Deployment Manager v3.7  ${NC}"
echo -e "${BLUE}=======================================${NC}"

# 1. Проверка настройки репозитория
CURRENT_REMOTE=$(git remote get-url origin 2>/dev/null)

if [[ $CURRENT_REMOTE != *"github.com"* ]]; then
  echo -e "${RED}❌ Удаленный репозиторий не настроен.${NC}"
  echo -e "${YELLOW}Выполните: git remote add origin https://github.com/Aleksey29212/Ru55darts.git${NC}"
  exit 1
fi

# 2. Подготовка файлов
echo -e "${BLUE}📦 Индексация файлов проекта...${NC}"
git add .

# 3. Фиксация изменений
COMMIT_MSG="Production Build v2.8+: Security Clean and UI Readability Polish"
echo -e "${BLUE}💾 Создание коммита: ${WHITE}$COMMIT_MSG${NC}"
git commit -m "$COMMIT_MSG" --quiet || echo -e "${YELLOW}ℹ️ Изменений для фиксации не обнаружено.${NC}"

# 4. Отправка (С принудительным отключением сломанных помощников)
echo -e "${YELLOW}📤 Отправка в GitHub (Master Push)...${NC}"

# Отключаем помощники для предотвращения ECONNREFUSED
if git -c credential.helper= push origin main; then
  echo -e "\n${BLUE}=======================================${NC}"
  echo -e "${GREEN}✅ ПРОЕКТ УСПЕШНО ДОСТАВЛЕН В GITHUB!${NC}"
  echo -e "${BLUE}=======================================${NC}"
  echo -e "\n${WHITE}Автоматическое развертывание начнется на подключенных хостингах.${NC}"
else
  echo -e "\n${RED}❌ Ошибка отправки.${NC}"
  echo -e "${YELLOW}GitHub может блокировать пуш из-за секретов в истории (см. ссылки в логе выше) или отсутствия авторизации.${NC}"
  echo -e "\n${WHITE}СДЕЛАЙТЕ СЛЕДУЮЩЕЕ:${NC}"
  echo -e "1. Кликните по ссылкам 'unblock-secret' в сообщении об ошибке выше, чтобы разрешить GitHub пропустить старые коммиты."
  echo -e "2. Если токен еще не привязан, выполните команду (подставив ваш токен):"
  echo -e "   ${BLUE}git remote set-url origin https://ВАШ_ТОКЕН@github.com/Aleksey29212/Ru55darts.git${NC}"
fi
