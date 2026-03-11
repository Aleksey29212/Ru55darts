'use client';

import { useState, useEffect, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { 
    Trophy, 
    ShieldCheck, 
    Award, 
    Star, 
    Users, 
    Baby, 
    Moon, 
    X, 
    Zap, 
    Target, 
    TrendingUp, 
    Medal, 
    Flame, 
    Sparkles,
    Wallet,
    Home,
    ChevronRight,
    BarChart2,
    ChevronsUp,
    Diamond,
    CircleUser
} from 'lucide-react';
import type { ScoringSettings, LeagueId, SponsorshipSettings } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import Link from 'next/link';

interface ScoringHelpDialogProps {
  settings: ScoringSettings | ScoringSettings[];
  leagueName: string | string[];
  sponsorshipSettings: SponsorshipSettings;
  children?: ReactNode;
}

const leagueIcons: Record<string, any> = {
    general: Trophy,
    evening_omsk: Moon,
    premier: ShieldCheck,
    first: Award,
    second: BarChart2,
    third: ChevronsUp,
    fourth: Diamond,
    cricket: Target,
    senior: Users,
    youth: Baby,
    women: CircleUser,
};

const leagueBookStyles: Record<string, string> = {
    general: 'from-cyan-600 to-cyan-900 border-cyan-400/50',
    evening_omsk: 'from-orange-600 to-orange-900 border-orange-400/50',
    premier: 'from-blue-600 to-blue-900 border-blue-400/50',
    first: 'from-amber-600 to-amber-900 border-amber-400/50',
    cricket: 'from-emerald-600 to-emerald-900 border-emerald-400/50',
    second: 'from-sky-600 to-sky-900 border-sky-400/50',
    third: 'from-indigo-600 to-indigo-900 border-indigo-400/50',
    fourth: 'from-purple-600 to-purple-900 border-purple-400/50',
    senior: 'from-blue-700 to-slate-900 border-blue-400/50',
    youth: 'from-lime-600 to-lime-900 border-lime-400/50',
    women: 'from-indigo-500 to-purple-900 border-pink-400/50',
};

export function ScoringHelpDialog({ settings, leagueName, children }: ScoringHelpDialogProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const settingsArray = Array.isArray(settings) ? settings : [settings];
  const namesArray = Array.isArray(leagueName) ? leagueName : [leagueName];

  if (!mounted) return children || null;

  const renderHelpPill = (label: string, val: string | number, Icon: any, colorClass: string, description?: string) => (
    <div className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-white/[0.05] border border-white/5 hover:border-primary/40 transition-all group shadow-lg active:scale-[0.98]">
        <div className="flex items-center gap-2.5 min-w-0">
            <div className={cn("p-1 rounded-lg bg-black/40 border border-white/5 shrink-0", colorClass)}>
                <Icon className="h-3.5 w-3.5" />
            </div>
            <div className="flex flex-col min-w-0">
                <span className="text-[10px] md:text-[11px] font-black text-white uppercase tracking-tight truncate leading-none">{label}</span>
                {description && (
                    <span className="text-[7px] md:text-[8px] text-muted-foreground font-bold uppercase tracking-tight truncate mt-0.5 opacity-60">{description}</span>
                )}
            </div>
        </div>
        <span className="text-base md:text-lg font-headline text-primary ml-2 drop-shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)] shrink-0 min-w-[30px] text-right">{val}</span>
    </div>
  );

  const renderLeagueContent = (s: ScoringSettings) => {
    if (s.isEveningOmsk) {
        return (
            <div className="flex flex-col gap-2 pt-1 pb-4">
                <div className="p-4 rounded-[1.5rem] bg-gradient-to-br from-orange-500/15 to-orange-950/30 border border-orange-500/20 space-y-3 relative overflow-hidden group shadow-xl">
                    <div className="absolute -top-6 -right-6 opacity-5 group-hover:scale-110 transition-transform duration-[5s]">
                        <Moon className="h-24 w-24 md:h-32 md:w-32 text-orange-500" />
                    </div>
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="p-1.5 bg-orange-500/20 rounded-lg shadow-xl border border-orange-500/30">
                            <Sparkles className="text-orange-400 h-4 w-4 md:h-5 md:w-5" />
                        </div>
                        <div className="flex flex-col">
                            <h4 className="font-headline text-sm md:text-base uppercase tracking-tight text-orange-400">Система множителей</h4>
                            <p className="text-[7px] uppercase font-black text-orange-300/40 tracking-widest">Вечерний Омск • Динамический расчет</p>
                        </div>
                    </div>
                    <div className="bg-black/40 p-2 rounded-xl border border-white/5 relative z-10">
                        <p className="text-[10px] text-white/70 leading-tight font-medium">
                            Формула: <span className="text-orange-400 font-black text-xs">AVG × Коэффициент этапа</span>
                        </p>
                        <p className="text-[8px] text-muted-foreground mt-1 uppercase tracking-tighter">В зачет идут 5 лучших туров сезона</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 relative z-10">
                        {renderHelpPill('Победитель', `× 1.00`, Medal, 'text-gold', '1-е место')}
                        {renderHelpPill('Финалист', `× 0.70`, Medal, 'text-silver', '2-е место')}
                        {renderHelpPill('1/2 финала', `× 0.50`, Medal, 'text-bronze', 'Полуфинал')}
                        {renderHelpPill('1/4 финала', `× 0.25`, Target, 'text-primary', 'Четвертьфинал')}
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-[1.25rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5 shadow-xl group">
                        <div className="bg-emerald-500/20 p-1.5 rounded-lg border border-emerald-500/20 shadow-inner">
                            <Wallet className="text-emerald-400 h-4 w-4 animate-pulse" />
                        </div>
                        <div className="text-left">
                            <h4 className="font-headline text-[8px] uppercase tracking-widest text-emerald-400">Курс балла</h4>
                            <p className="text-[10px] text-white font-bold">{s.exchangeRate || 7} ₽</p>
                        </div>
                    </div>
                    <div className="p-3 rounded-[1.25rem] bg-blue-500/10 border border-blue-500/20 flex items-center gap-2.5 shadow-xl group">
                        <div className="bg-blue-500/20 p-1.5 rounded-lg border border-blue-500/20 shadow-inner">
                            <Award className="text-blue-400 h-4 w-4" />
                        </div>
                        <div className="text-left">
                            <h4 className="font-headline text-[8px] uppercase tracking-widest text-blue-400">Суперфинал</h4>
                            <p className="text-[10px] text-white font-bold">ТОП-16</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-3 md:gap-4 pt-1 pb-4">
            <div className="space-y-1.5">
                <div className="flex items-center gap-2 px-3 border-l-2 border-orange-500 bg-white/5 py-1 rounded-r-xl shadow-md">
                    <Trophy className="h-3 w-3 text-orange-500" />
                    <div className="flex flex-col">
                        <h4 className="font-headline text-[9px] uppercase tracking-tight text-white leading-none">Очки за места</h4>
                    </div>
                </div>
                <div className="grid gap-1">
                    {renderHelpPill('1 МЕСТО', s.pointsFor1st, Medal, 'text-gold', 'Победа')}
                    {renderHelpPill('2 МЕСТО', s.pointsFor2nd, Medal, 'text-silver', 'Финал')}
                    {renderHelpPill('3-4 МЕСТА', s.pointsFor3rd_4th, Medal, 'text-bronze', 'Полуфинал')}
                    {renderHelpPill('5-8 МЕСТА', s.pointsFor5th_8th, Target, 'text-primary', '1/4 финала')}
                    {renderHelpPill('9-16 МЕСТА', s.pointsFor9th_16th, TrendingUp, 'text-primary/60', '1/8 финала')}
                    {renderHelpPill('УЧАСТИЕ', s.participationPoints, Users, 'text-muted-foreground', 'Группа')}
                </div>
            </div>

            <div className="space-y-1.5">
                <div className="flex items-center gap-2 px-3 border-l-2 border-cyan-400 bg-white/5 py-1 rounded-r-xl shadow-md">
                    <Star className="h-3 w-3 text-cyan-400" />
                    <div className="flex flex-col">
                        <h4 className="font-headline text-[9px] uppercase tracking-tight text-white leading-none">Бонусы статистики</h4>
                    </div>
                </div>
                <div className="grid gap-1">
                    {s.enable180Bonus && renderHelpPill('MAX 180', `+${s.bonusPer180}`, Sparkles, 'text-orange-400', 'За 180')}
                    {s.enableHiOutBonus && renderHelpPill(`HI-OUT ≥ ${s.hiOutThreshold}`, `+${s.hiOutBonus}`, Zap, 'text-yellow-400', 'Высокое закрытие')}
                    {s.enableAvgBonus && renderHelpPill(`AVG ≥ ${s.avgThreshold}`, `+${s.avgBonus}`, TrendingUp, 'text-cyan-400', 'Высокий средний')}
                    {s.enableShortLegBonus && renderHelpPill(`ЛЕГ ≤ ${s.shortLegThreshold}`, `+${s.shortLegBonus}`, Flame, 'text-rose-500', 'Скорость')}
                    {s.enable9DarterBonus && renderHelpPill('9-DARTER', `+${s.bonusFor9Darter}`, Star, 'text-purple-400', 'Идеально')}
                    
                    {!(s.enable180Bonus || s.enableHiOutBonus || s.enableAvgBonus || s.enableShortLegBonus || s.enable9DarterBonus) && (
                        <div className="flex flex-col items-center justify-center py-4 border border-dashed border-white/5 rounded-xl opacity-30 bg-black/10">
                            <Zap className="h-4 w-4 text-muted-foreground mb-1" />
                            <p className="text-[7px] uppercase font-black tracking-widest">Бонусы отсутствуют</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/10 transition-all border border-white/5 shadow-xl">
            <Trophy className="text-primary h-5 w-5" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="glassmorphism max-w-4xl p-0 overflow-hidden border-white/10 rounded-[2rem] shadow-[0_0_100px_rgba(0,0,0,1)] bg-[#050505] w-[96vw] md:w-full max-h-[92dvh] flex flex-col transition-all duration-500">
        
        <DialogHeader className="bg-gradient-to-b from-white/5 to-transparent pt-2 pb-2 px-6 relative items-center text-center shrink-0 border-b border-white/5">
            <Button onClick={() => setOpen(false)} asChild variant="ghost" size="icon" className="absolute left-4 top-2 h-8 w-8 rounded-lg hover:bg-white/5 z-20 transition-all shadow-xl border border-white/5">
                <Link href="/">
                    <Home className="h-4 w-4 text-primary" />
                </Link>
            </Button>

            <DialogClose className="absolute right-4 top-2 h-8 w-8 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-all z-20 flex items-center justify-center border border-white/5">
                <X className="h-4 w-4 text-muted-foreground" />
            </DialogClose>
            
            <DialogTitle className="flex flex-col items-center">
                <span className="text-base md:text-xl uppercase font-headline tracking-tighter text-white text-glow leading-tight">Регламент</span>
                <span className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.3em] text-primary/60">Правила начисления очков</span>
            </DialogTitle>
        </DialogHeader>

        <div className="p-0 flex flex-col flex-1 overflow-hidden relative">
            <Tabs 
                defaultValue={settingsArray[0]?.id || "general"} 
                className="w-full flex flex-col h-full"
            >
                <div className="relative z-20 mb-2 shrink-0 px-4 md:px-6 mt-2">
                    <div className="w-full overflow-x-auto no-scrollbar mask-fade-edges">
                        <TabsList className="bg-black/90 backdrop-blur-3xl p-1 border border-white/10 h-auto flex flex-nowrap md:grid md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-1 mx-auto w-max md:w-full rounded-[1rem] shadow-2xl">
                            {settingsArray.map((s, idx) => {
                                const id = s.id || 'general';
                                const Icon = leagueIcons[id] || Trophy;
                                const style = leagueBookStyles[id] || leagueBookStyles.general;
                                return (
                                    <TabsTrigger 
                                        key={idx} 
                                        value={id} 
                                        className={cn(
                                            "relative flex flex-col items-center justify-center w-12 h-14 sm:w-14 sm:h-16 md:w-full md:h-14 rounded-lg border-2 transition-all duration-500 shrink-0",
                                            "bg-gradient-to-br shadow-xl overflow-hidden",
                                            "data-[state=active]:-translate-y-1 data-[state=active]:scale-105 data-[state=active]:border-white/60 data-[state=active]:z-10",
                                            "data-[state=inactive]:opacity-30 data-[state=inactive]:grayscale-[0.6] data-[state=inactive]:hover:opacity-100",
                                            style
                                        )}
                                    >
                                        <Icon className="h-3.5 w-3.5 md:h-4 md:w-4 mb-0.5 text-white" />
                                        <span className="text-[5px] md:text-[6px] font-black uppercase tracking-tight text-white text-center leading-none px-1 line-clamp-1">
                                            {namesArray[idx] || 'Лига'}
                                        </span>
                                    </TabsTrigger>
                                )
                            })}
                        </TabsList>
                    </div>
                </div>

                <ScrollArea className="flex-1 px-4 md:px-10 lg:px-16 pb-10">
                    {settingsArray.map((s, idx) => (
                        <TabsContent key={idx} value={s.id || 'general'} className="outline-none animate-in fade-in slide-in-from-bottom-2 duration-500 mt-0">
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-sm md:text-lg font-headline uppercase tracking-tight text-white/90">
                                    {namesArray[idx]}
                                </h3>
                                <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                            </div>
                            {renderLeagueContent(s)}
                        </TabsContent>
                    ))}
                </ScrollArea>
            </Tabs>
        </div>

        <div className="bg-black/95 backdrop-blur-3xl p-2 border-t border-white/5 shrink-0">
          <div className="flex flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-headline text-primary text-[10px]">D</div>
                <div className="flex flex-col">
                    <p className="text-[8px] text-white font-black uppercase tracking-widest leading-none">DartBrig Pro</p>
                    <p className="text-[6px] text-primary/60 font-bold uppercase tracking-widest">v2.6 Stable • Ultra Compact</p>
                </div>
            </div>
            
            <Button onClick={() => setOpen(false)} asChild variant="outline" className="rounded-lg font-black uppercase tracking-widest text-[8px] h-8 px-6 md:px-8 gap-2 border-white/5 bg-white/5 hover:bg-primary hover:text-primary-foreground transition-all">
                <Link href="/">
                    <Home className="h-3 w-3 text-primary" />
                    <span>ЗАКРЫТЬ</span>
                    <ChevronRight className="h-3 w-3" />
                </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
