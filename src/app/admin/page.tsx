
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Calculator, Users, Wand2, Trophy, Camera, Library, Handshake, Image, BarChart, CloudDownload, Code2, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { ClearTournamentsButton } from "./tournaments/clear-button";
import { ClearButton as ClearPlayersButton } from "./players/clear-button";
import { ClearPartnersButton } from "./partners/clear-partners-button";
import { ClearAnalyticsButton } from "./analytics/clear-analytics-button";
import { getTournaments } from "@/lib/tournaments";
import { getPlayerProfiles } from "@/lib/players";
import { getPartners } from "@/lib/partners";
import { getLeagueSettings } from "@/lib/settings";
import type { LeagueId } from "@/lib/types";

const adminSections = [
    { href: '/admin/source-code', title: 'КОД (ЭТАЛОН)', icon: Code2, color: 'text-primary', description: 'Спецификации системы' },
    { href: '/admin/import', title: 'ИМПОРТ ТУРНИРОВ', icon: CloudDownload, color: 'text-primary', description: 'Загрузка с сайта' },
    { href: '/admin/tournaments', title: 'АРХИВ ТУРНИРОВ', icon: Trophy, color: 'text-primary', description: 'Просмотр результатов' },
    { href: '/admin/analytics', title: 'АНАЛИТИКА', icon: BarChart, color: 'text-primary', description: 'Визиты и клики' },
    { href: '/admin/leagues', title: 'УПРАВЛЕНИЕ ЛИГАМИ', icon: Library, color: 'text-primary', description: 'Включение и названия' },
    { href: '/admin/scoring', title: 'НАСТРОЙКИ ОЧКОВ', icon: Calculator, color: 'text-primary', description: 'Правила начисления' },
    { href: '/admin/players', title: 'ИГРОКИ', icon: Users, color: 'text-primary', description: 'Профили и спонсоры' },
    { href: '/admin/style-studio', title: 'СТУДИЯ СТИЛЕЙ', icon: Wand2, description: 'Генерация тем ИИ' },
    { href: '/admin/photo-studio', title: 'ФОТОСТУДИЯ', icon: Camera, description: 'Загрузка аватаров' },
    { href: '/admin/partners', title: 'ПАРТНЕРЫ', icon: Handshake, description: 'Магазины и связи' },
    { href: '/admin/background', title: 'ФОН САЙТА', icon: Image, description: 'Глобальное изображение' }
];

function StatCard({ title, count, icon: Icon, priority = false }: { title: string, count: number, icon: any, priority?: boolean }) {
    return (
        <Card className={cn(
            "glassmorphism border-primary/20 transition-all duration-300 transform hover:scale-105 group cursor-default",
            priority ? 'bg-primary/15 border-primary/40 ring-2 ring-primary/20 shadow-[0_0_40px_rgba(var(--primary-rgb),0.2)]' : 'bg-primary/5 hover:bg-primary/10'
        )}>
            <CardContent className="p-6 flex items-center justify-between">
                <div>
                    <p className={cn(
                        "text-[9px] font-black uppercase tracking-[0.2em]",
                        priority ? 'text-primary' : 'text-muted-foreground'
                    )}>{title}</p>
                    <p className="text-3xl md:text-4xl font-headline mt-2 tracking-tighter text-white">{count}</p>
                </div>
                <div className={cn(
                    "p-3 rounded-xl transition-all duration-500 group-hover:rotate-12",
                    priority ? 'bg-primary/30 text-primary' : 'bg-primary/10'
                )}>
                    <Icon className={cn("h-6 w-6 md:h-7 md:w-7", priority ? 'text-primary' : 'text-primary/60')} />
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
    <div className="space-y-10 pb-32 animate-in fade-in duration-700">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="ТУРНИРОВ В БАЗЕ" count={tournaments?.length || 0} icon={Trophy} priority />
            <StatCard title="ВСЕГО ИГРОКОВ" count={players?.length || 0} icon={Users} />
            <StatCard title="АКТИВНЫХ ЛИГ" count={enabledLeaguesCount} icon={Library} />
            <StatCard title="ПАРТНЕРОВ" count={partners?.length || 0} icon={Handshake} />
        </section>

        <div className="space-y-4">
            <div className="flex items-center gap-4 ml-2">
                <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">MANAGEMENT</h2>
            </div>
            <section className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {adminSections.map(section => (
                    <Button key={section.href} asChild variant="outline" className={cn(
                        "h-auto py-5 md:py-6 justify-start glassmorphism border-white/5 hover:border-primary/60 group transition-all duration-300 rounded-2xl interactive-scale overflow-hidden",
                        section.href === '/admin/source-code' ? 'border-primary/40 bg-primary/10' : ''
                    )}>
                        <Link href={section.href} className="flex items-center gap-4 w-full text-left">
                            <div className={cn(
                                "p-2.5 rounded-xl transition-all duration-500 group-hover:scale-110 shrink-0",
                                section.href === '/admin/source-code' ? 'bg-primary/30' : 'bg-muted group-hover:bg-primary/20'
                            )}>
                                <section.icon className={cn("h-5 w-5", section.color || 'text-muted-foreground/80')} />
                            </div>
                            <div className="flex flex-col flex-1 min-w-0">
                                <span className="font-headline text-[11px] md:text-[13px] tracking-tight leading-tight text-white group-hover:text-primary transition-colors line-clamp-2 uppercase">
                                    {section.title}
                                </span>
                                <span className="text-[8px] text-muted-foreground line-clamp-1 opacity-50 uppercase font-black tracking-widest mt-0.5">
                                    {section.description}
                                </span>
                            </div>
                            <ArrowRight className="h-4 w-4 text-primary transition-all translate-x-[-5px] group-hover:translate-x-0 opacity-0 group-hover:opacity-100 shrink-0" />
                        </Link>
                    </Button>
                ))}
            </section>
        </div>

        <section className="space-y-4">
            <div className="flex items-center gap-4 ml-2">
                <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-destructive/60">DANGER ZONE</h2>
            </div>
            
            <Card className="glassmorphism border-destructive/40 bg-destructive/5 rounded-3xl overflow-hidden">
                <CardContent className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 md:p-8">
                    <div className="p-4 rounded-xl border border-destructive/20 bg-black/40 flex flex-col gap-3">
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">ТУРНИРЫ</span>
                        <ClearTournamentsButton />
                    </div>
                    <div className="p-4 rounded-xl border border-destructive/20 bg-black/40 flex flex-col gap-3">
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">ПРОФИЛИ</span>
                        <ClearPlayersButton />
                    </div>
                    <div className="p-4 rounded-xl border border-destructive/20 bg-black/40 flex flex-col gap-3">
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">ПАРТНЕРЫ</span>
                        <ClearPartnersButton />
                    </div>
                    <div className="p-4 rounded-xl border border-destructive/20 bg-black/40 flex flex-col gap-3">
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">АНАЛИТИКА</span>
                        <ClearAnalyticsButton />
                    </div>
                </CardContent>
            </Card>
        </section>
    </div>
  );
}
