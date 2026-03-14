#!/bin/bash

# DartBrig Pro: Production Deployment Script (v3.5 Secured)
# Автоматизация подготовки и отправки кода с интегрированным токеном доступа

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
WHITE='\033[1;37m'
NC='\033[0m'

# Использование токена для автоматической авторизации
TOKEN="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"
TARGET_REPO="https://$TOKEN@github.com/Aleksey29212/Ru55darts.git"

echo -e "${BLUE}=======================================${NC}"
echo -e "${GREEN}   DartBrig Pro: Deployment Manager v3.5  ${NC}"
echo -e "${BLUE}=======================================${NC}"

# 1. Проверка на целостность Git
echo -e "${BLUE}🔍 Настройка удаленного репозитория...${NC}"
git remote set-url origin "$TARGET_REPO" 2>/dev/null || git remote add origin "$TARGET_REPO"

# 2. Подготовка файлов
echo -e "${BLUE}📦 Индексация файлов проекта...${NC}"
git add .

# 3. Фиксация изменений
COMMIT_MSG="Production Build v2.8+: Tokenized Deploy, Senior League Support and UI Readability Fix"
echo -e "${BLUE}💾 Создание коммита: ${WHITE}$COMMIT_MSG${NC}"
git commit -m "$COMMIT_MSG" --quiet || echo -e "${YELLOW}ℹ️ Изменений для фиксации не обнаружено.${NC}"

# 4. Отправка (С обходом сломанных помощников и использованием токена)
echo -e "${YELLOW}📤 Отправка в GitHub (Master Push)...${NC}"

# Принудительно отключаем помощники, которые вызывают ошибки сокетов
if git -c credential.helper= push -u origin main --force; then
  echo -e "\n${BLUE}=======================================${NC}"
  echo -e "${GREEN}✅ ПРОЕКТ УСПЕШНО ДОСТАВЛЕН В ОБЛАКО!${NC}"
  echo -e "${BLUE}=======================================${NC}"
  echo -e "\n${WHITE}Развертывание начнется автоматически на подключенных хостингах.${NC}"
else
  echo -e "\n${RED}❌ Ошибка отправки.${NC}"
  echo -e "${YELLOW}Попробуйте вручную обновить URL командой:${NC}"
  echo -e "${WHITE}git remote set-url origin https://ВАШ_ТОКЕН@github.com/Aleksey29212/Ru55darts.git${NC}"
fi
