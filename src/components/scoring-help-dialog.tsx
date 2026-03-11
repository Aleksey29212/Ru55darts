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
    <div className="flex items-center justify-between py-3 px-4 rounded-[1.25rem] bg-white/[0.07] border border-white/10 hover:border-primary/50 transition-all group shadow-xl active:scale-[0.98]">
        <div className="flex items-center gap-3 min-w-0">
            <div className={cn("p-2 rounded-xl bg-black/60 border border-white/10 shadow-inner shrink-0", colorClass)}>
                <Icon className="h-5 w-5" />
            </div>
            <div className="flex flex-col min-w-0">
                <span className="text-[11px] md:text-xs font-black text-white uppercase tracking-wider truncate leading-tight">{label}</span>
                {description && (
                    <span className="text-[8px] md:text-[9px] text-muted-foreground font-bold uppercase tracking-tight truncate mt-0.5 opacity-70">{description}</span>
                )}
            </div>
        </div>
        <span className="text-xl md:text-2xl font-headline text-primary ml-3 drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.6)] shrink-0 min-w-[40px] text-right">{val}</span>
    </div>
  );

  const renderLeagueContent = (s: ScoringSettings) => {
    if (s.isEveningOmsk) {
        return (
            <div className="flex flex-col gap-6 pt-2">
                <div className="p-6 md:p-8 rounded-[2rem] bg-gradient-to-br from-orange-500/20 to-orange-950/40 border-2 border-orange-500/30 space-y-6 relative overflow-hidden group shadow-2xl">
                    <div className="absolute -top-10 -right-10 opacity-10 group-hover:scale-110 transition-transform duration-[5s]">
                        <Moon className="h-40 w-48 md:h-56 md:w-56 text-orange-500" />
                    </div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="p-2.5 bg-orange-500/30 rounded-xl shadow-2xl border border-orange-500/40">
                            <Sparkles className="text-orange-400 h-6 w-6 md:h-7 md:w-7" />
                        </div>
                        <div className="flex flex-col">
                            <h4 className="font-headline text-lg md:text-xl uppercase tracking-widest text-orange-400">Система множителей</h4>
                            <p className="text-[9px] uppercase font-black text-orange-300/50 tracking-[0.2em]">Вечерний Омск • Динамический расчет</p>
                        </div>
                    </div>
                    <p className="text-xs md:text-sm text-white/80 leading-relaxed font-medium relative z-10 max-w-xl">
                        В этой лиге баллы не фиксированы. Они рассчитываются по формуле: <br/>
                        <span className="text-orange-400 font-black text-base bg-orange-500/20 px-3 py-1 rounded-lg inline-block mt-2 border border-orange-500/30 shadow-inner">AVG × Коэффициент этапа</span>
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 relative z-10">
                        {renderHelpPill('Победитель', `AVG × 1.00`, Medal, 'text-gold', '1-е место')}
                        {renderHelpPill('Финалист', `AVG × 0.70`, Medal, 'text-silver', '2-е место')}
                        {renderHelpPill('1/2 финала', `AVG × 0.50`, Medal, 'text-bronze', 'Полуфинал')}
                        {renderHelpPill('1/4 финала', `AVG × 0.25`, Target, 'text-primary', 'Четвертьфинал')}
                    </div>
                </div>
                <div className="p-6 md:p-8 rounded-[2rem] bg-emerald-500/10 border-2 border-emerald-500/20 flex flex-col sm:flex-row items-center gap-4 md:gap-6 shadow-3xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <div className="bg-emerald-500/20 p-4 rounded-[1.5rem] border border-emerald-500/30 shadow-inner relative z-10">
                        <Wallet className="text-emerald-400 h-8 w-8 md:h-10 md:w-10 animate-pulse" />
                    </div>
                    <div className="text-center sm:text-left relative z-10">
                        <h4 className="font-headline text-base md:text-lg uppercase tracking-widest text-emerald-400 mb-1">Финансовые выплаты</h4>
                        <div className="space-y-1">
                            <p className="text-[11px] md:text-xs text-white/90 font-bold leading-tight uppercase tracking-tight">
                                Актуальный курс: <span className="text-emerald-400 text-base ml-1">{s.exchangeRate || 7} ₽ за 1 балл</span>
                            </p>
                            <p className="text-[9px] md:text-[10px] text-muted-foreground font-black uppercase tracking-[0.1em]">
                                В зачет идут <span className="text-white">5 лучших туров</span> сезона
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 md:gap-8 pt-2">
            <div className="space-y-4">
                <div className="flex items-center gap-3 px-4 border-l-4 border-orange-500 bg-white/5 py-3 rounded-r-2xl shadow-lg">
                    <div className="p-1.5 bg-orange-500/20 rounded-lg"><Trophy className="h-5 w-5 text-orange-500" /></div>
                    <div className="flex flex-col">
                        <h4 className="font-headline text-xs md:text-sm uppercase tracking-widest text-white leading-none">Очки за места</h4>
                        <p className="text-[8px] font-black uppercase text-white/30 tracking-[0.2em] mt-0.5">Placement</p>
                    </div>
                </div>
                <div className="grid gap-2.5 md:gap-3">
                    {renderHelpPill('1 МЕСТО', s.pointsFor1st, Medal, 'text-gold', 'Победа')}
                    {renderHelpPill('2 МЕСТО', s.pointsFor2nd, Medal, 'text-silver', 'Финал')}
                    {renderHelpPill('3-4 МЕСТА', s.pointsFor3rd_4th, Medal, 'text-bronze', 'Полуфинал')}
                    {renderHelpPill('5-8 МЕСТА', s.pointsFor5th_8th, Target, 'text-primary', '1/4 финала')}
                    {renderHelpPill('9-16 МЕСТА', s.pointsFor9th_16th, TrendingUp, 'text-primary/60', '1/8 финала')}
                    {renderHelpPill('УЧАСТИЕ', s.participationPoints, Users, 'text-muted-foreground', 'Групповой этап')}
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-3 px-4 border-l-4 border-cyan-400 bg-white/5 py-3 rounded-r-2xl shadow-lg">
                    <div className="p-1.5 bg-cyan-500/20 rounded-lg"><Star className="h-5 w-5 text-cyan-400" /></div>
                    <div className="flex flex-col">
                        <h4 className="font-headline text-xs md:text-sm uppercase tracking-widest text-white leading-none">Бонусы статистики</h4>
                        <p className="text-[8px] font-black uppercase text-white/30 tracking-[0.2em] mt-0.5">Performance</p>
                    </div>
                </div>
                <div className="grid gap-2.5 md:gap-3">
                    {s.enable180Bonus && renderHelpPill('MAX 180', `+${s.bonusPer180}`, Sparkles, 'text-orange-400', 'За каждый максимум')}
                    {s.enableHiOutBonus && renderHelpPill(`HI-OUT ≥ ${s.hiOutThreshold}`, `+${s.hiOutBonus}`, Zap, 'text-yellow-400', 'Высокое закрытие')}
                    {s.enableAvgBonus && renderHelpPill(`AVG ≥ ${s.avgThreshold}`, `+${s.avgBonus}`, TrendingUp, 'text-cyan-400', 'Высокий средний')}
                    {s.enableShortLegBonus && renderHelpPill(`ЛЕГ ≤ ${s.shortLegThreshold}`, `+${s.shortLegBonus}`, Flame, 'text-rose-500', 'Скоростное закрытие')}
                    {s.enable9DarterBonus && renderHelpPill('9-DARTER', `+${s.bonusFor9Darter}`, Star, 'text-purple-400', 'Идеальный лег')}
                    
                    {!(s.enable180Bonus || s.enableHiOutBonus || s.enableAvgBonus || s.enableShortLegBonus || s.enable9DarterBonus) && (
                        <div className="flex flex-col items-center justify-center py-10 md:py-16 border-2 border-dashed border-white/10 rounded-[2rem] opacity-40 bg-black/20">
                            <div className="p-4 rounded-full bg-white/5 mb-4"><Zap className="h-8 w-8 text-muted-foreground" /></div>
                            <p className="text-[9px] md:text-[10px] uppercase font-black tracking-[0.3em] text-center leading-relaxed max-w-[180px]">Бонусы не активны</p>
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
          <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-primary/10 transition-all border border-white/5 shadow-xl">
            <Trophy className="text-primary h-6 w-6" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="glassmorphism max-w-6xl p-0 overflow-hidden border-white/10 rounded-[2rem] md:rounded-[3rem] shadow-[0_0_120px_rgba(0,0,0,1)] bg-[#050505] w-[98vw] md:w-full max-h-[94vh] flex flex-col transition-all duration-500">
        
        <DialogHeader className="bg-gradient-to-b from-white/10 to-transparent pt-6 md:pt-10 pb-10 md:pb-16 px-8 relative items-center text-center shrink-0 border-b border-white/5">
            <Button onClick={() => setOpen(false)} asChild variant="ghost" size="icon" className="absolute left-4 md:left-10 top-4 md:top-8 h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-[1.5rem] hover:bg-white/10 z-20 transition-all active:scale-90 shadow-2xl border border-white/10 group">
                <Link href="/">
                    <Home className="h-5 w-5 md:h-7 md:w-7 text-primary group-hover:scale-110 transition-transform" />
                </Link>
            </Button>

            <DialogClose className="absolute right-4 md:right-10 top-4 md:top-8 h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-[1.5rem] hover:bg-red-500/20 hover:text-red-500 transition-all z-20 flex items-center justify-center border border-white/10 active:scale-90 shadow-2xl group">
                <X className="h-5 w-5 md:h-7 md:w-7 text-muted-foreground group-hover:scale-110 transition-transform" />
            </DialogClose>
            
            <DialogTitle className="flex flex-col items-center gap-1 md:gap-2">
                <span className="text-2xl md:text-6xl uppercase font-headline tracking-tighter text-white text-glow drop-shadow-[0_0_40px_rgba(255,255,255,0.4)] leading-none">Регламент</span>
                <div className="flex items-center gap-3 md:gap-4">
                    <div className="h-[1px] w-6 md:w-16 bg-gradient-to-r from-transparent to-primary" />
                    <span className="text-[8px] md:text-xs font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-primary drop-shadow-[0_0_15px_currentColor]">Официальные правила</span>
                    <div className="h-[1px] w-6 md:w-16 bg-gradient-to-l from-transparent to-primary" />
                </div>
            </DialogTitle>
        </DialogHeader>

        <div className="p-0 flex flex-col flex-1 overflow-hidden relative">
            <Tabs 
                defaultValue={settingsArray[0]?.id || "general"} 
                className="w-full flex flex-col h-full"
            >
                <div className="relative z-20 -mt-6 md:-mt-10 mb-6 md:mb-10 shrink-0 px-4 md:px-8">
                    <div className="w-full overflow-x-auto no-scrollbar mask-fade-edges pb-2">
                        <TabsList className="bg-black/80 backdrop-blur-3xl p-2 md:p-4 border-2 border-white/10 h-auto flex flex-nowrap md:grid md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 md:gap-3 mx-auto w-max md:w-full rounded-[1.5rem] md:rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
                            {settingsArray.map((s, idx) => {
                                const id = s.id || 'general';
                                const Icon = leagueIcons[id] || Trophy;
                                const style = leagueBookStyles[id] || leagueBookStyles.general;
                                return (
                                    <TabsTrigger 
                                        key={idx} 
                                        value={id} 
                                        className={cn(
                                            "relative flex flex-col items-center justify-center w-16 h-20 sm:w-20 sm:h-24 md:w-full md:h-28 rounded-xl md:rounded-[1.5rem] border-2 transition-all duration-500 shrink-0",
                                            "bg-gradient-to-br shadow-2xl overflow-hidden",
                                            "data-[state=active]:-translate-y-2 md:data-[state=active]:-translate-y-4 data-[state=active]:scale-105 data-[state=active]:border-white data-[state=active]:z-10 data-[state=active]:shadow-[0_15px_40px_rgba(255,255,255,0.2)]",
                                            "data-[state=inactive]:opacity-40 data-[state=inactive]:grayscale-[0.5] data-[state=inactive]:scale-95 data-[state=inactive]:hover:opacity-100 data-[state=inactive]:hover:grayscale-0",
                                            style
                                        )}
                                    >
                                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <Icon className="h-5 w-5 md:h-8 md:w-8 mb-1.5 md:mb-2 text-white drop-shadow-xl" />
                                        <span className="text-[7px] md:text-[10px] font-black uppercase tracking-tight text-white text-center leading-tight px-1.5 drop-shadow-lg line-clamp-2">
                                            {namesArray[idx] || 'Лига'}
                                        </span>
                                        <div className="absolute left-0.5 top-1/4 bottom-1/4 w-0.5 bg-white/20 rounded-full" />
                                    </TabsTrigger>
                                )
                            })}
                        </TabsList>
                    </div>
                </div>

                <ScrollArea className="flex-1 px-4 md:px-12 lg:px-20 pb-8 md:pb-16">
                    {settingsArray.map((s, idx) => (
                        <TabsContent key={idx} value={s.id || 'general'} className="outline-none animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="flex items-center gap-4 md:gap-6 mb-6 md:mb-8">
                                <h3 className="text-xl md:text-4xl font-headline uppercase tracking-tighter text-white text-glow-white drop-shadow-2xl">
                                    {namesArray[idx]}
                                </h3>
                                <div className="h-[1px] flex-1 bg-gradient-to-r from-white/20 to-transparent" />
                            </div>
                            {renderLeagueContent(s)}
                        </TabsContent>
                    ))}
                </ScrollArea>
            </Tabs>
        </div>

        <div className="bg-black/95 backdrop-blur-3xl p-6 md:p-8 border-t border-white/10 shrink-0">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8">
            <div className="flex items-center gap-4">
                <div className="h-10 w-10 md:h-14 md:w-14 rounded-lg md:rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center font-headline text-primary text-xl md:text-2xl shadow-xl">D</div>
                <div className="flex flex-col">
                    <p className="text-xs md:text-sm text-white font-black uppercase tracking-[0.2em] leading-none mb-1">DartBrig Pro Core</p>
                    <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        <p className="text-[8px] md:text-[11px] text-primary/80 font-black uppercase tracking-[0.15em]">v2.6 Stable • Enterprise Edition</p>
                    </div>
                </div>
            </div>
            
            <Button onClick={() => setOpen(false)} asChild variant="outline" className="w-full md:w-auto rounded-xl md:rounded-2xl font-black uppercase tracking-[0.15em] text-[9px] md:text-xs h-12 md:h-16 px-8 md:px-12 gap-3 border-white/10 bg-white/5 hover:bg-primary hover:text-primary-foreground transition-all group">
                <Link href="/">
                    <Home className="h-4 w-4 md:h-5 md:w-5 text-primary group-hover:scale-110 transition-transform" />
                    <span>Закрыть справочник</span>
                    <ChevronRight className="h-3 w-3 md:h-4 md:w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
