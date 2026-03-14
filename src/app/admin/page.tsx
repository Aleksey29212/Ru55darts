import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Calculator, Users, Wand2, Trophy, Camera, Library, Handshake, Image, BarChart, CloudDownload, Code2, AlertOctagon, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ClearTournamentsButton } from "./tournaments/clear-button";
import { ClearButton as ClearPlayersButton } from "./players/clear-button";
import { ClearPartnersButton } from "./partners/clear-partners-button";
import { ClearAnalyticsButton } from "./analytics/clear-analytics-button";
import { ViewModeToggle } from "@/components/view-mode-toggle";
import { getTournaments } from "@/lib/tournaments";
import { getPlayerProfiles } from "@/lib/players";
import { getPartners } from "@/lib/partners";
import { getLeagueSettings } from "@/lib/settings";
import type { LeagueId } from "@/lib/types";

const adminSections = [
    { href: '/admin/source-code', title: 'Код программы (ЭТАЛОН)', icon: Code2, color: 'text-primary', description: 'Спецификации и исходные коды' },
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

function StatCard({ title, count, icon: Icon, priority = false }: { title: string, count: number, icon: any, priority?: boolean }) {
    return (
        <Card className={cn(
            "glassmorphism border-primary/20 transition-all duration-300 transform hover:scale-105 group cursor-default",
            priority ? 'bg-primary/15 border-primary/40 ring-2 ring-primary/20 shadow-[0_0_40px_rgba(var(--primary-rgb),0.2)]' : 'bg-primary/5 hover:bg-primary/10'
        )}>
            <CardContent className="p-6 md:p-8 flex items-center justify-between">
                <div>
                    <p className={cn(
                        "text-[9px] font-black uppercase tracking-[0.2em]",
                        priority ? 'text-primary' : 'text-muted-foreground'
                    )}>{title}</p>
                    <p className="text-3xl md:text-5xl font-headline mt-2 tracking-tighter text-white">{count}</p>
                </div>
                <div className={cn(
                    "p-3 rounded-2xl shadow-2xl transition-all duration-500 group-hover:rotate-12",
                    priority ? 'bg-primary/30 text-primary' : 'bg-primary/10'
                )}>
                    <Icon className={cn("h-6 w-6 md:h-8 md:w-8", priority ? 'text-primary' : 'text-primary/60')} />
                </div>
            </CardContent>
        </Card>
    );
}

export default async function AdminPage() {
  const tournaments = await getTournaments();
  const players = await getPlayerProfiles();
  const partners = await getPartners();
  const leagueSettings = await getLeagueSettings();

  const enabledLeaguesCount = Object.keys(leagueSettings).filter(key => leagueSettings[key as LeagueId].enabled).length;

  return (
    <div className="space-y-12 pb-32 animate-in fade-in duration-700">
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="ТУРНИРОВ В БАЗЕ" count={tournaments?.length || 0} icon={Trophy} priority />
            <StatCard title="ВСЕГО ИГРОКОВ" count={players?.length || 0} icon={Users} />
            <StatCard title="АКТИВНЫХ ЛИГ" count={enabledLeaguesCount} icon={Library} />
            <StatCard title="ПАРТНЕРОВ" count={partners?.length || 0} icon={Handshake} />
        </section>

        <section className="space-y-6">
            <div className="flex items-center gap-4 ml-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">INTERFACE CONTROL</h2>
            </div>
            <Card className="glassmorphism border-primary/30 bg-primary/10 overflow-hidden relative group/toggle">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover/toggle:opacity-100 transition-opacity duration-700" />
                <CardContent className="p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="p-4 rounded-2xl bg-primary/20 shadow-2xl border border-primary/30">
                            <Settings2 className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-headline text-2xl md:text-3xl tracking-tight text-white">Быстрое переключение вида</h3>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black mt-2 opacity-60">ПРОВЕРКА АДАПТИВНОСТИ ДЛЯ РАЗНЫХ УСТРОЙСТВ</p>
                        </div>
                    </div>
                    <ViewModeToggle showLabels className="bg-black/80 p-2 scale-110 md:scale-125" />
                </CardContent>
            </Card>
        </section>

        <div className="space-y-6">
            <div className="flex items-center gap-4 ml-2">
                <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">SYSTEM MANAGEMENT</h2>
            </div>
            <section className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {adminSections.map(section => (
                    <Button key={section.href} asChild variant="outline" className={cn(
                        "h-auto py-6 md:py-8 justify-start glassmorphism border-white/5 hover:border-primary/60 group transition-all duration-300 rounded-[1.5rem] md:rounded-[2rem] interactive-scale shadow-2xl overflow-hidden",
                        section.href === '/admin/source-code' ? 'border-primary/40 bg-primary/10' : ''
                    )}>
                        <Link href={section.href} className="flex items-center gap-4 w-full text-left">
                            <div className={cn(
                                "p-3 rounded-xl transition-all duration-500 shadow-3xl group-hover:scale-110 shrink-0",
                                section.href === '/admin/source-code' ? 'bg-primary/30' : 'bg-muted group-hover:bg-primary/20'
                            )}>
                                <section.icon className={cn("h-5 w-5 md:h-6 md:w-6", section.color || 'text-muted-foreground/80')} />
                            </div>
                            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                                <span className="font-headline text-sm md:text-base tracking-tight leading-tight mb-1 text-white group-hover:text-primary transition-colors line-clamp-2">
                                    {section.title}
                                </span>
                                <span className="text-[8px] text-muted-foreground line-clamp-1 opacity-50 uppercase font-black tracking-widest">
                                    {section.description}
                                </span>
                            </div>
                            <ArrowRight className="h-5 w-5 text-primary transition-all translate-x-[-10px] group-hover:translate-x-0 opacity-0 group-hover:opacity-100 shrink-0" />
                        </Link>
                    </Button>
                ))}
            </section>
        </div>

        <section className="space-y-6">
            <div className="flex items-center gap-4 ml-2">
                <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-destructive/60">MAINTENANCE ZONE</h2>
            </div>
            
            <Card className="glassmorphism border-destructive/40 bg-destructive/5 rounded-[2rem] md:rounded-[3rem] overflow-hidden">
                <CardHeader className="p-6 md:p-10 border-b border-destructive/20 bg-destructive/10">
                    <CardTitle className="text-2xl md:text-3xl font-headline tracking-tighter text-destructive uppercase">Опасная зона</CardTitle>
                    <CardDescription className="text-destructive/60 font-bold uppercase tracking-widest text-[9px] md:text-[10px]">БЫСТРАЯ ОЧИСТКА БАЗЫ ДАННЫХ И ЛОГОВ</CardDescription>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 p-6 md:p-10">
                    <div className="p-5 rounded-2xl border border-destructive/20 bg-black/40 flex flex-col gap-3 shadow-3xl">
                        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">ТУРНИРЫ</span>
                        <ClearTournamentsButton />
                    </div>
                    <div className="p-5 rounded-2xl border border-destructive/20 bg-black/40 flex flex-col gap-3 shadow-3xl">
                        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">ПРОФИЛИ</span>
                        <ClearPlayersButton />
                    </div>
                    <div className="p-5 rounded-2xl border border-destructive/20 bg-black/40 flex flex-col gap-3 shadow-3xl">
                        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">ПАРТНЕРЫ</span>
                        <ClearPartnersButton />
                    </div>
                    <div className="p-5 rounded-2xl border border-destructive/20 bg-black/40 flex flex-col gap-3 shadow-3xl">
                        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">АНАЛИТИКА</span>
                        <ClearAnalyticsButton />
                    </div>
                </CardContent>
            </Card>
        </section>
    </div>
  );
}
