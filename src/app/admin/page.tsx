'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Calculator, Users, Wand2, Trophy, Camera, Library, Handshake, Image, BarChart, CloudDownload, Code2, AlertOctagon, Settings2, Rocket, Check, Copy, ExternalLink } from "lucide-react";
import { useCollection, useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { AllLeagueSettings, LeagueId } from "@/lib/types";
import { ClearTournamentsButton } from "./tournaments/clear-button";
import { ClearButton as ClearPlayersButton } from "./players/clear-button";
import { ClearPartnersButton } from "./partners/clear-partners-button";
import { ClearAnalyticsButton } from "./analytics/clear-analytics-button";
import { ViewModeToggle } from "@/components/view-mode-toggle";
import { isFirebaseConfigValid } from "@/firebase/config";
import { useState } from "react";

const adminSections = [
    { href: '/admin/source-code', title: 'Код программы (ЭТАЛОН)', icon: Code2, color: 'text-primary', description: 'Спецификации и исходные коды для других ИИ' },
    { href: '/admin/import', title: 'Импорт турниров', icon: CloudDownload, color: 'text-primary', description: 'Загрузка данных с dartsbase.ru' },
    { href: '/admin/tournaments', title: 'Архив турниров', icon: Trophy, color: 'text-primary', description: 'Просмотр и удаление результатов' },
    { href: '/admin/analytics', title: 'Аналитика', icon: BarChart, color: 'text-primary', description: 'Статистика посещений и кликов' },
    { href: '/admin/leagues', title: 'Управление лигами', icon: Library, color: 'text-primary', description: 'Включение и названия лиг' },
    { href: '/admin/scoring', title: 'Настройки очков', icon: Calculator, color: 'text-primary', description: 'Правила начисления баллов' },
    { href: '/admin/players', title: 'Управление игроками', icon: Users, color: 'text-primary', description: 'Профили и спонсоры' },
    { href: '/admin/style-studio', title: 'Студия стилей', icon: Wand2, description: 'Генерация тем через ИИ' },
    { href: '/admin/photo-studio', title: 'Фотостудия', icon: Camera, description: 'Обрезка и загрузка аватаров' },
    { href: '/admin/partners', title: 'Партнеры', icon: Handshake, description: 'Магазины и спонсорство' },
    { href: '/admin/background', title: 'Фон страницы', icon: Image, description: 'Глобальный фон сайта' }
];

function StatCard({ title, count, icon: Icon, isLoading, priority = false }: { title: string, count: number, icon: any, isLoading: boolean, priority?: boolean }) {
    return (
        <Card className={cn(
            "glassmorphism border-primary/20 transition-all duration-75",
            priority ? 'bg-primary/10 border-primary ring-1 ring-primary/20 shadow-lg shadow-primary/10' : 'bg-primary/5 hover:bg-primary/10'
        )}>
            <CardContent className="p-6 flex items-center justify-between">
                <div>
                    <p className={cn(
                        "text-[10px] font-bold uppercase tracking-[0.2em]",
                        priority ? 'text-primary' : 'text-muted-foreground'
                    )}>{title}</p>
                    {isLoading ? <Skeleton className="h-10 w-16 mt-2" /> : <p className="text-4xl font-headline mt-1 tracking-tighter">{count}</p>}
                </div>
                <div className={cn(
                    "p-3 rounded-2xl shadow-inner",
                    priority ? 'bg-primary/20' : 'bg-primary/10'
                )}>
                    <Icon className={cn("h-8 w-8", priority ? 'text-primary' : 'text-primary/70')} />
                </div>
            </CardContent>
        </Card>
    );
}

function SetupGuide() {
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    const copyToClipboard = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    return (
        <Card className="glassmorphism border-primary/50 bg-primary/5 mb-12 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-700">
            <CardHeader className="bg-primary/10 border-b border-primary/20">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/20 rounded-2xl">
                        <Settings2 className="h-8 w-8 text-primary animate-spin-slow" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-headline uppercase tracking-tight text-primary">Мастер настройки (Критично)</CardTitle>
                        <CardDescription className="text-foreground/80">Для полноценной работы сайта на вашем сервере необходимо добавить ключи из Firebase Console.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs">
                        <Rocket className="h-4 w-4" />
                        Добавьте эти переменные в настройки вашего хостинга или в .env.local
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                        {[
                            'NEXT_PUBLIC_FIREBASE_API_KEY',
                            'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
                            'NEXT_PUBLIC_FIREBASE_APP_ID',
                            'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
                            'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
                            'NEXT_PUBLIC_ADMIN_PASSWORD'
                        ].map((key) => (
                            <div key={key} className="group flex items-center justify-between bg-black/60 rounded-xl p-3 border border-white/5 hover:border-primary/30 transition-all">
                                <code className="text-[9px] md:text-[10px] text-primary/80 font-bold truncate mr-2">{key}</code>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 px-3 text-[10px] uppercase font-bold text-muted-foreground hover:text-primary gap-2 shrink-0"
                                    onClick={() => copyToClipboard(key, key)}
                                >
                                    {copiedKey === key ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                    {copiedKey === key ? 'Готово' : 'Копия'}
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white/5 rounded-2xl p-6 border border-white/10 flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-1 space-y-2">
                        <h4 className="font-bold text-sm uppercase tracking-widest">Инструкция для Firebase</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed italic">
                            Зайдите в <strong>Project Settings</strong> &rarr; <strong>Your apps</strong> &rarr; <strong>Config</strong>. 
                            Скопируйте значения и вставьте их в панель управления сервером. Сайт оживет автоматически.
                        </p>
                    </div>
                    <Button variant="outline" className="rounded-xl font-bold uppercase tracking-widest text-xs h-12 gap-2" asChild>
                        <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer">
                            В Консоль Firebase <ExternalLink className="h-4 w-4" />
                        </a>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export default function AdminPage() {
  const db = useFirestore();
  
  const tournamentsQuery = useMemoFirebase(() => db ? collection(db, 'tournaments') : null, [db]);
  const { data: tournaments, isLoading: isLoadingTournaments } = useCollection(tournamentsQuery);

  const playersQuery = useMemoFirebase(() => db ? collection(db, 'players') : null, [db]);
  const { data: players, isLoading: isLoadingPlayers } = useCollection(playersQuery);

  const partnersQuery = useMemoFirebase(() => db ? collection(db, 'partners') : null, [db]);
  const { data: partners, isLoading: isLoadingPartners } = useCollection(partnersQuery);

  const leagueSettingsRef = useMemoFirebase(() => db ? doc(db, 'app_settings', 'leagues') : null, [db]);
  const { data: leagueSettings, isLoading: isLoadingLeagues } = useDoc<AllLeagueSettings>(leagueSettingsRef);

  const enabledLeaguesCount = leagueSettings 
    ? (Object.keys(leagueSettings) as LeagueId[]).filter(key => leagueSettings[key].enabled).length 
    : 1;

  const isConfigured = isFirebaseConfigValid;

  return (
    <div className="space-y-12 pb-24">
        {/* Показываем мастер настройки только если ключи не валидны */}
        {!isConfigured && <SetupGuide />}

        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Турниров в базе" count={tournaments?.length || 0} icon={Trophy} isLoading={isLoadingTournaments} priority />
            <StatCard title="Всего игроков" count={players?.length || 0} icon={Users} isLoading={isLoadingPlayers} />
            <StatCard title="Активных лиг" count={enabledLeaguesCount} icon={Library} isLoading={isLoadingLeagues} />
            <StatCard title="Партнеров" count={partners?.length || 0} icon={Handshake} isLoading={isLoadingPartners} />
        </section>

        {/* Interface Management Panel */}
        <section className="space-y-6">
            <div className="flex items-center gap-3 ml-2">
                <Settings2 className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-headline uppercase tracking-[0.3em] text-muted-foreground">Управление интерфейсом</h2>
            </div>
            <Card className="glassmorphism border-primary/20 bg-primary/5">
                <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-primary/10">
                            <Settings2 className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg leading-tight">Быстрое переключение вида</h3>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mt-1">Проверка адаптивности на лету</p>
                        </div>
                    </div>
                    <ViewModeToggle showLabels className="bg-black/60 p-2" />
                </CardContent>
            </Card>
        </section>

        <div className="space-y-6">
            <div className="flex items-center gap-3 ml-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <h2 className="text-sm font-headline uppercase tracking-[0.3em] text-muted-foreground">Навигация по разделам</h2>
            </div>
            <section className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {adminSections.map(section => (
                    <Button key={section.href} asChild variant="outline" className={cn(
                        "h-auto py-8 justify-start glassmorphism border-white/5 hover:border-primary/50 group transition-all duration-75 rounded-2xl interactive-scale",
                        section.href === '/admin/source-code' ? 'border-primary/30 bg-primary/5' : ''
                    )}>
                        <Link href={section.href} className="flex items-center gap-4 w-full text-left">
                            <div className={cn(
                                "p-3 rounded-xl transition-colors shadow-inner",
                                section.href === '/admin/source-code' ? 'bg-primary/20' : 'bg-muted group-hover:bg-primary/10'
                            )}>
                                <section.icon className={cn("h-6 w-6", section.color || 'text-muted-foreground')} />
                            </div>
                            <div className="flex flex-col flex-1 overflow-hidden">
                                <span className="font-bold text-base tracking-tight leading-none mb-1">{section.title}</span>
                                <span className="text-[10px] text-muted-foreground line-clamp-1 opacity-70 uppercase font-bold tracking-tight">{section.description}</span>
                            </div>
                            <ArrowRight className="h-12 w-12 text-primary transition-all translate-x-[-15px] group-hover:translate-x-0 opacity-30 group-hover:opacity-100 shrink-0" />
                        </Link>
                    </Button>
                ))}
            </section>
        </div>

        {/* Danger Zone */}
        <section className="space-y-6">
            <div className="flex items-center gap-3 ml-2">
                <AlertOctagon className="h-5 w-5 text-destructive animate-pulse" />
                <h2 className="text-sm font-headline uppercase tracking-[0.3em] text-destructive">Системное обслуживание (Danger Zone)</h2>
            </div>
            
            <Card className="glassmorphism border-destructive/30 bg-destructive/5">
                <CardHeader>
                    <CardTitle className="text-xl font-headline tracking-tight text-destructive uppercase">Глобальная очистка блоков</CardTitle>
                    <CardDescription>Используйте эти кнопки для принудительного удаления данных в каждом из разделов системы. Действия необратимы.</CardDescription>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl border border-destructive/20 bg-black/20 flex flex-col gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Блок Турниров</span>
                        <ClearTournamentsButton />
                    </div>
                    <div className="p-4 rounded-xl border border-destructive/20 bg-black/20 flex flex-col gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Блок Игроков</span>
                        <ClearPlayersButton />
                    </div>
                    <div className="p-4 rounded-xl border border-destructive/20 bg-black/20 flex flex-col gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Блок Партнеров</span>
                        <ClearPartnersButton />
                    </div>
                    <div className="p-4 rounded-xl border border-destructive/20 bg-black/20 flex flex-col gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Блок Аналитики</span>
                        <ClearAnalyticsButton />
                    </div>
                </CardContent>
            </Card>
        </section>
    </div>
  );
}
