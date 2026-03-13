'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileCode, Calculator, Sparkles, Database, ShieldCheck, Download, Zap, Globe, Wand2, ShieldAlert, BarChart, LayoutTemplate } from "lucide-react";
import { CodeBlock } from "./code-block";
import { Button } from "@/components/ui/button";

const FILES = [
  {
    id: "deployment",
    name: "deployment-specs.md",
    icon: Zap,
    language: "markdown",
    description: "СПЕЦИФИКАЦИЯ ДЕПЛОЯ. Технические требования для системного администратора или DevOps-инженера.",
    content: `# DartBrig Pro: Deployment Specs
## Стек: Next.js 15 + Node.js 20
## Режим: standalone (output: 'standalone' в next.config.ts)

### Процесс установки:
1. Подключить GitHub репозиторий к хостингу (Vercel / Timeweb Cloud).
2. Настроить Environment Variables (см. README.md).
3. Firebase: В консоли Firebase включить Firestore и Anonymous Auth.
4. Security Rules: Использовать правила из файла firestore.rules в корне проекта.

### Особенности:
- Система использует Memory Cache для демо-режима и Firestore для Production.
- Фотографии хранятся в Base64 внутри документов Firestore (Collection: 'players').
- Аналитика (посещения) пишется в коллекцию 'visits' в неблокирующем режиме.`
  },
  {
    id: "scraper",
    name: "scraping-master.ts",
    icon: Globe,
    language: "typescript",
    description: "МАСТЕР-ЛОГИКА ПАРСИНГА. Полный цикл извлечения данных с dartsbase.ru: поиск даты в H1, динамический маппинг колонок и глубокая очистка чисел.",
    content: `/**
 * ЭТАЛОННЫЙ ПАРСЕР DARTSBASE (Версия 4.8 Master)
 */
export async function scrapeTournamentData(input, leagueId, scoringSettings) {
  const url = input.startsWith('http') ? input : \`https://dartsbase.ru/tournaments/\${input}/stats\`;
  const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0...' } });
  // Динамический маппинг колонок (AVG, 180, Hi-Out) по ключевым словам в thead.
}`
  },
  {
    id: "scoring",
    name: "scoring-engine.ts",
    icon: Calculator,
    language: "typescript",
    description: "ДВИГАТЕЛЬ РАСЧЕТОВ. Реализация двух систем: фиксированные баллы и кумулятивный множитель (Вечерний Омск).",
    content: `/**
 * РАСЧЕТ БАЛЛОВ (Standard + Omsk Hybrid)
 * ИСПРАВЛЕНО: Победитель Омска получает ровно 1.0 множитель.
 */
function calculatePlayerPoints(result, settings) {
    if (settings.isEveningOmsk) {
        let multiplier = 0;
        if (result.rank === 1) multiplier = 1.00;
        else if (result.rank === 2) multiplier = 0.70;
        else if (result.rank <= 4) multiplier = 0.50;
        else if (result.rank <= 8) multiplier = 0.25;
        result.points = Math.round(result.avg * multiplier);
        return;
    }
    // Стандартные очки + бонусы за 180 и Hi-Out
}`
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
                    Полная спецификация всех функциональных блоков системы. Используйте как мастер-копию для восстановления или передачи специалисту по деплою.
                </CardDescription>
            </div>
          </div>
          <Button onClick={handleDownloadAll} className="gap-3 shrink-0 shadow-2xl shadow-primary/30 h-14 px-8 font-bold rounded-2xl interactive-scale" size="lg">
            <Download className="h-5 w-5" />
            Скачать всё (Full Pack)
          </Button>
        </CardHeader>
      </Card>

      <Tabs defaultValue="deployment" className="w-full">
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