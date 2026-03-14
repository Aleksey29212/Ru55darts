#!/bin/bash

# DartBrig Pro: Production Deployment Script (v3.6 Secured)
# Автоматизация подготовки и отправки кода с интегрированным токеном доступа

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
WHITE='\033[1;37m'
NC='\033[0m'

# Использование нового токена для автоматической авторизации
TOKEN="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"
TARGET_REPO="https://$TOKEN@github.com/Aleksey29212/Ru55darts.git"

echo -e "${BLUE}=======================================${NC}"
echo -e "${GREEN}   DartBrig Pro: Deployment Manager v3.6  ${NC}"
echo -e "${BLUE}=======================================${NC}"

# 1. Настройка удаленного репозитория
echo -e "${BLUE}🔍 Настройка удаленного репозитория...${NC}"
git remote set-url origin "$TARGET_REPO" 2>/dev/null || git remote add origin "$TARGET_REPO"

# 2. Подготовка файлов
echo -e "${BLUE}📦 Индексация файлов проекта...${NC}"
git add .

# 3. Фиксация изменений
COMMIT_MSG="Production Build v2.8+: New Tokenized Deploy, Scoring Context Labels and UI Readability Fix"
echo -e "${BLUE}💾 Создание коммита: ${WHITE}$COMMIT_MSG${NC}"
git commit -m "$COMMIT_MSG" --quiet || echo -e "${YELLOW}ℹ️ Изменений для фиксации не обнаружено.${NC}"

# 4. Отправка (С принудительным отключением сломанных помощников)
echo -e "${YELLOW}📤 Отправка в GitHub (Master Push)...${NC}"

# Принудительно отключаем помощники, которые могут вызывать ошибки ECONNREFUSED в облачных IDE
if git -c credential.helper= push -u origin main --force; then
  echo -e "\n${BLUE}=======================================${NC}"
  echo -e "${GREEN}✅ ПРОЕКТ УСПЕШНО ДОСТАВЛЕН В GITHUB!${NC}"
  echo -e "${BLUE}=======================================${NC}"
  echo -e "\n${WHITE}Автоматическое развертывание начнется на подключенных хостингах.${NC}"
else
  echo -e "\n${RED}❌ Ошибка отправки.${NC}"
  echo -e "${YELLOW}Проверьте валидность токена и наличие прав 'repo'.${NC}"
fi
