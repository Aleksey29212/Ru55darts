#!/bin/bash

# DartBrig Pro: Production Deployment Script (v3.1 Stable)
# Автоматизация подготовки и отправки кода в репозиторий

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
WHITE='\033[1;37m'
NC='\033[0m'

TARGET_REPO="https://github.com/Aleksey29212/Ru55darts.git"

echo -e "${BLUE}=======================================${NC}"
echo -e "${GREEN}   DartBrig Pro: Deployment Manager v3  ${NC}"
echo -e "${BLUE}=======================================${NC}"

# 1. Проверка на целостность Git
echo -e "${BLUE}🔍 Проверка локальной базы Git...${NC}"
CHECK_GIT=$(git status 2>&1)

if [[ $CHECK_GIT == *"empty"* ]] || [[ $CHECK_GIT == *"fatal"* ]] || [ ! -d .git ]; then
  echo -e "${RED}⚠️ Обнаружено повреждение Git или отсутствие репозитория.${NC}"
  echo -e "${YELLOW}🔄 Выполняю принудительную ре-инициализацию...${NC}"
  rm -rf .git
  git init
  git branch -M main
  git remote add origin "$TARGET_REPO"
  echo -e "${GREEN}✅ Git успешно восстановлен.${NC}"
else
  # Убеждаемся, что remote настроен верно
  git remote remove origin 2>/dev/null
  git remote add origin "$TARGET_REPO"
  echo -e "${GREEN}✅ Git в норме. Репозиторий подключен.${NC}"
fi

# 2. Подготовка файлов
echo -e "${BLUE}📦 Индексация файлов проекта...${NC}"
rm -f src/app/deploy.sh 2>/dev/null
git add .

# 3. Фиксация изменений
COMMIT_MSG="Production Build v2.8+: Math Audit, Senior League Support and UI Stability"
echo -e "${BLUE}💾 Создание коммита: ${WHITE}$COMMIT_MSG${NC}"
git commit -m "$COMMIT_MSG" --quiet || echo -e "${YELLOW}ℹ️ Изменений для фиксации не обнаружено.${NC}"

# 4. Отправка
echo -e "${YELLOW}📤 Отправка в GitHub (Force Push)...${NC}"
echo -e "${WHITE}Примечание: Используйте Personal Access Token при запросе пароля.${NC}"

# Пытаемся запушить, временно отключая сломанный помощник учетных данных, если он мешает
if git -c credential.helper= push -u origin main --force; then
  echo -e "\n${BLUE}=======================================${NC}"
  echo -e "${GREEN}✅ ПРОЕКТ УСПЕШНО ДОСТАВЛЕН В ОБЛАКО!${NC}"
  echo -e "${BLUE}=======================================${NC}"
  echo -e "\n${WHITE}Следующие шаги:${NC}"
  echo -e "${YELLOW}1. Для Firebase:${NC} Развертывание начнется автоматически (App Hosting)."
  echo -e "${YELLOW}2. Для Timeweb:${NC} Зайдите в панель и нажмите 'Пересобрать' в проекте Docker-compose."
else
  echo -e "\n${RED}❌ Ошибка отправки. GitHub отклонил доступ.${NC}"
  echo -e "${YELLOW}КАК ИСПРАВИТЬ:${NC}"
  echo -e "1. Создайте токен на GitHub: Settings -> Developer Settings -> Personal Access Tokens (Classic) -> Generate (нужны права 'repo')."
  echo -e "2. Выполните команду в терминале, подставив свой токен:"
  echo -e "${WHITE}git remote set-url origin https://ВАШ_ТОКЕН@github.com/Aleksey29212/Ru55darts.git${NC}"
  echo -e "3. Снова запустите ${GREEN}npm run deploy:github${NC}"
fi
