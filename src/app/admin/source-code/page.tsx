'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileCode, Calculator, Sparkles, Database, ShieldCheck, Download, Zap, Globe, Wand2, ShieldAlert, BarChart, LayoutTemplate } from "lucide-react";
import { CodeBlock } from "./code-block";
import { Button } from "@/components/ui/button";

const FILES = [
  {
    id: "scraper",
    name: "scraping-master.ts",
    icon: Globe,
    language: "typescript",
    description: "МАСТЕР-ЛОГИКА ПАРСИНГА. Полный цикл извлечения данных с dartsbase.ru: поиск даты в H1, динамический маппинг колонок и глубокая очистка чисел (extractNumber).",
    content: `/**
 * ЭТАЛОННЫЙ ПАРСЕР DARTSBASE (Версия 4.8 Master)
 * ГАРАНТИЯ: Игнорирует текст в скобках, находит реальную дату турнира.
 */

export async function scrapeTournamentData(input, leagueId, scoringSettings) {
  // 1. Формирование URL (авто-определение ID или прямой ссылки)
  const url = input.startsWith('http') ? input : \`https://dartsbase.ru/tournaments/\${input}/stats\`;
  
  // 2. Загрузка с User-Agent десктопа для обхода базовой защиты
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0.0.0' }
  });
  const html = await response.text();
  const $ = cheerio.load(html);

  // 3. Извлечение МЕТАДАННЫХ (Дата из H1 имеет высший приоритет)
  const h1 = $('h1').first();
  const dateMatch = h1.text().match(/(\\d{2})\\.(\\d{2})\\.(\\d{4})/);
  const tournamentDate = dateMatch ? new Date(Date.UTC(dateMatch[3], dateMatch[2]-1, dateMatch[1])) : new Date();

  // 4. SMART MAPPING: Динамический поиск индексов колонок
  const headerMap = {};
  const headerRow = $('table').first().find('thead tr').first();
  
  headerRow.find('th, td').each((i, el) => {
    const txt = $(el).text().trim().toLowerCase();
    if (['avg', 'average'].some(k => txt.includes(k))) headerMap['avg'] = i;
    if (['180', '180s'].some(k => txt === k)) headerMap['180'] = i;
    if (['checkout', 'hi-out', 'max out', 'hf'].some(k => txt.includes(k))) headerMap['hiout'] = i;
    if (['игрок', 'player', 'имя'].some(k => txt.includes(k))) headerMap['player'] = i;
    if (['#', 'место', 'rank'].some(k => txt.includes(k))) headerMap['rank'] = i;
  });

  // 5. НОРМАЛИЗАЦИЯ (extractNumber): Очистка "130 (T20, T20, D5)" -> 130
  const extractNumber = (val) => {
    const match = String(val).match(/\\d+/); // Берем только ПЕРВОЕ число
    return match ? parseInt(match[0], 10) : 0;
  };

  // 6. Формирование TournamentPlayerResult и расчет баллов...
}`
  },
  {
    id: "scoring",
    name: "scoring-engine.ts",
    icon: Calculator,
    language: "typescript",
    description: "ДВИГАТЕЛЬ РАСЧЕТОВ. Реализация двух систем: фиксированные баллы (Standard) и кумулятивный множитель (Вечерний Омск).",
    content: `/**
 * РАСЧЕТ БАЛЛОВ (Standard + Omsk Hybrid)
 */
function calculatePlayerPoints(result, settings) {
    if (settings.isEveningOmsk) {
        // Уникальная формула "Вечернего Омска": Баллы = AVG * Накопленный множитель этапа
        let multiplier = 0;
        if (result.rank <= 8) multiplier += 0.25; 
        if (result.rank <= 4) multiplier += 0.50;
        if (result.rank <= 2) multiplier += 0.70;
        if (result.rank === 1) multiplier += 1.00;
        
        result.points = Math.round(result.avg * multiplier);
        return;
    }

    // Стандартная система: Очки за раунд + Бонусы (180, Hi-Out, Short Leg)
    result.basePoints = getPointsForRank(result.rank, settings);
    
    // Применение динамических бонусов из админки
    if (settings.enable180Bonus) result.bonusPoints += result.n180s * settings.bonusPer180;
    if (settings.enableHiOutBonus && result.hiOut >= settings.hiOutThreshold) {
        result.bonusPoints += settings.hiOutBonus;
    }
}`
  },
  {
    id: "aggregation",
    name: "aggregation.ts",
    icon: Database,
    language: "typescript",
    description: "АГРЕГАТОР РЕЙТИНГА. Логика объединения результатов турниров в общую таблицу без дублирования данных.",
    content: `/**
 * ГЛОБАЛЬНАЯ АГРЕГАЦИЯ (Engine v3.7)
 * ИСПРАВЛЕНО: Предотвращение двойного начисления очков в Общем зачете.
 */
allTournaments.forEach(t => {
    const lInfo = leagueSettings[t.league];
    if (!lInfo || !lInfo.enabled) return;

    t.players.forEach(p => {
        // 1. Начисление в локальный рейтинг лиги
        addToLeague(t.league, p);

        // 2. Начисление в Общий зачет
        // КРИТИЧЕСКОЕ УСЛОВИЕ: Только если лига входит в зачет и это НЕ сама лига 'general'
        if (t.league !== 'general' && lInfo.includeInGeneralRanking) {
            addToLeague('general', p);
        }
    });
});`
  },
  {
    id: "theming",
    name: "theme-engine.ts",
    icon: Wand2,
    language: "typescript",
    description: "СИСТЕМА СТИЛИЗАЦИИ. Динамическое управление HSL-переменными через ИИ и серверные экшены.",
    content: `/**
 * THEME INJECTION (Engine v2.0)
 * Обновление globals.css через Node.js fs для мгновенного применения стилей
 */
export async function updateThemeAction(theme) {
  const cssFilePath = path.join(process.cwd(), 'src/app/globals.css');
  
  // Генерация нового блока .dark с HSL-переменными
  const newVars = {
    '--background': theme.background,
    '--primary': theme.primary,
    '--accent': theme.accent,
    '--gold': theme.gold,
    // ...остальные переменные
  };

  // Регулярное выражение для поиска и замены блока темы в файле
  const newCss = existingContent.replace(darkThemeRegex, generateNewBlock(newVars));
  await fs.writeFile(cssFilePath, newCss);
}`
  },
  {
    id: "security",
    name: "security-gate.tsx",
    icon: ShieldAlert,
    language: "typescript",
    description: "БЕЗОПАСНОСТЬ. Реализация скрытого триггера (Lambda) и управление административной сессией.",
    content: `/**
 * LAMBDA ACCESS (Hidden Entrance)
 * Реализация скрытого входа через символ 'λ' в UI
 */
const handleLambdaClick = () => {
  // Переключение формы входа под изображением (без перекрытия контента)
  setShowLoginForm(!showLoginForm);
};

const login = (password) => {
  if (password === ADMIN_PASSWORD) {
    sessionStorage.setItem('db_admin_session', 'true');
    setIsAdmin(true);
    router.push('/admin'); // Мгновенный Snappy-переход
  }
};`
  },
  {
    id: "analytics",
    name: "analytics-tracker.ts",
    icon: BarChart,
    language: "typescript",
    description: "АНАЛИТИКА. Трекинг посещений (VisitLogger) и кликов по спонсорским ссылкам для отчетности партнерам.",
    content: `/**
 * TRACKING SYSTEM (Non-blocking)
 * Логирование действий без замедления работы пользователя
 */
export async function logVisitAction() {
  const headersList = headers();
  // Фильтрация ботов через User-Agent
  if (/bot|crawl|spider/i.test(headersList.get('user-agent'))) return;
  
  await addDoc(collection(db, 'visits'), { 
    timestamp: serverTimestamp() 
  });
}

export async function logSponsorClick(playerId, sponsorName) {
  // Анонимная запись факта клика
  await addDoc(collection(db, 'sponsor_clicks'), { 
    playerId, sponsorName, timestamp: serverTimestamp() 
  });
}`
  },
  {
    id: "components",
    name: "ui-standards.tsx",
    icon: LayoutTemplate,
    language: "typescript",
    description: "UI СТАНДАРТЫ. Описание принципов Glassmorphism, Responsive Cards и Snappy UI (эффект нажатия).",
    content: `/**
 * DartBrig Pro UI CORE
 * 1. Glassmorphism: bg-card/85 + backdrop-blur-3xl + white/10 border
 * 2. Snappy UI: active:scale-95 + transition-all (200ms)
 * 3. Accessibility: Полноценное использование ARIA и Mobile-First Accordions
 */

const GlassCard = ({ children }) => (
  <div className="glassmorphism rounded-[2.5rem] border-white/10 active:scale-[0.98] transition-all">
    {children}
  </div>
);`
  }
];

export default function SourceCodePage() {
  const handleDownloadAll = () => {
    let text = "DARTBRIG PRO - ПОЛНАЯ ЭТАЛОННАЯ ДОКУМЕНТАЦИЯ (MASTER COPY)\n=======================================================\n\n";
    FILES.forEach(f => {
      text += "БЛОК: " + f.name + "\nОПИСАНИЕ: " + f.description + "\n\n" + f.content + "\n\n-------------------------------------------------------\n\n";
    });
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "dartbrig_pro_full_logic_etalon.txt";
    link.click();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <Card className="glassmorphism bg-primary/5 border-primary/30 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <ShieldCheck className="h-32 w-32 -mr-8 -mt-8" />
        </div>
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 relative z-10">
          <div className="flex items-center gap-5">
            <div className="bg-primary/20 p-4 rounded-2xl shadow-inner border border-primary/20">
                <Zap className="text-primary h-8 w-8 animate-pulse" />
            </div>
            <div>
                <CardTitle className="text-3xl font-headline tracking-tight uppercase">Библиотека алгоритмов (ЭТАЛОН)</CardTitle>
                <CardDescription className="text-foreground/70 text-base max-w-xl">
                    Полная спецификация всех функциональных блоков системы. Используйте как мастер-копию для восстановления или обучения моделей ИИ.
                </CardDescription>
            </div>
          </div>
          <Button onClick={handleDownloadAll} className="gap-3 shrink-0 shadow-2xl shadow-primary/30 h-14 px-8 font-bold rounded-2xl interactive-scale" size="lg">
            <Download className="h-5 w-5" />
            Скачать всё (Full Pack)
          </Button>
        </CardHeader>
      </Card>

      <Tabs defaultValue="scraper" className="w-full">
        <div className="overflow-x-auto pb-4 mb-6 scrollbar-hide no-scrollbar">
            <TabsList className="flex w-full min-w-[1000px] h-16 bg-muted/20 p-2 rounded-2xl border border-white/5 shadow-inner">
            {FILES.map(file => {
                const Icon = file.icon;
                return (
                    <TabsTrigger key={file.id} value={file.id} className="flex-1 gap-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all font-bold uppercase tracking-tighter text-[10px] active:scale-95">
                        <Icon className="h-4 w-4" />
                        <span>{file.name.split('.')[0]}</span>
                    </TabsTrigger>
                );
            })}
            </TabsList>
        </div>

        {FILES.map(file => (
          <TabsContent key={file.id} value={file.id} className="outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Card className="glassmorphism overflow-hidden border-primary/20 shadow-xl">
              <CardHeader className="border-b bg-muted/30 p-6">
                <CardTitle className="text-xl flex items-center gap-3">
                    <file.icon className="h-6 w-6 text-primary" />
                    {file.name}
                </CardTitle>
                <CardDescription className="mt-1 font-medium text-primary/80">{file.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <CodeBlock code={file.content} language={file.language} />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}