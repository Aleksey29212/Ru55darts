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
    <div className="flex items-center justify-between py-3 md:py-4 px-4 md:px-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-primary/40 transition-all group shadow-lg active:scale-95">
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
            <div className={cn("p-2 md:p-2.5 rounded-xl bg-black/40 border border-white/10 shadow-inner shrink-0", colorClass)}>
                <Icon className="h-4 w-4 md:h-5 md:w-5" />
            </div>
            <div className="flex flex-col min-w-0">
                <span className="text-[10px] md:text-[11px] font-bold text-white uppercase tracking-widest truncate leading-tight">{label}</span>
                {description && (
                    <span className="text-[8px] md:text-[9px] text-muted-foreground font-bold uppercase tracking-tight truncate mt-1 opacity-60">{description}</span>
                )}
            </div>
        </div>
        <span className="text-xl md:text-2xl font-headline text-primary ml-3 md:ml-4 drop-shadow-[0_0_12px_rgba(var(--primary-rgb),0.4)] shrink-0 min-w-[40px] text-right">{val}</span>
    </div>
  );

  const renderLeagueContent = (s: ScoringSettings) => {
    if (s.isEveningOmsk) {
        return (
            <div className="flex flex-col gap-6 md:gap-8 pt-4">
                <div className="p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] bg-orange-500/10 border-2 border-orange-500/20 space-y-6 relative overflow-hidden group">
                    <div className="absolute -top-10 -right-10 opacity-5 group-hover:scale-110 transition-transform duration-[3s]">
                        <Moon className="h-32 w-32 md:h-48 md:w-48 text-orange-500" />
                    </div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="p-2.5 bg-orange-500/20 rounded-xl shadow-xl border border-orange-500/30">
                            <Sparkles className="text-orange-500 h-5 w-5 md:h-6 md:w-6" />
                        </div>
                        <h4 className="font-headline text-base md:text-lg uppercase tracking-widest text-orange-400">Система множителей</h4>
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed font-medium relative z-10">
                        В этой лиге баллы не фиксированы. Они рассчитываются по формуле: <br/>
                        <span className="text-white font-bold bg-orange-500/20 px-2 py-0.5 rounded">AVG × Коэффициент этапа</span>
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 relative z-10">
                        {renderHelpPill('Победитель', `AVG × 1.00`, Medal, 'text-gold')}
                        {renderHelpPill('Финалист', `AVG × 0.70`, Medal, 'text-silver')}
                        {renderHelpPill('1/2 финала', `AVG × 0.50`, Medal, 'text-bronze')}
                        {renderHelpPill('1/4 финала', `AVG × 0.25`, Target, 'text-primary')}
                    </div>
                </div>
                <div className="p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] bg-emerald-500/10 border-2 border-emerald-500/20 flex flex-col sm:flex-row items-center gap-4 md:gap-6 shadow-2xl">
                    <div className="bg-emerald-500/20 p-3 md:p-4 rounded-2xl md:rounded-3xl border border-emerald-500/30">
                        <Wallet className="text-emerald-400 h-8 w-8 md:h-10 md:w-10" />
                    </div>
                    <div className="text-center sm:text-left">
                        <h4 className="font-headline text-sm md:text-base uppercase tracking-widest text-emerald-400 mb-1">Выплаты сезона</h4>
                        <p className="text-[10px] md:text-xs text-muted-foreground font-medium leading-relaxed">
                            Курс: <span className="text-white font-bold">{s.exchangeRate || 7} ₽ за 1 балл</span>. <br/>
                            В зачет идут <span className="text-white font-bold">5 лучших туров</span> из всех сыгранных.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 md:gap-10 pt-4">
            <div className="space-y-4 md:space-y-6">
                <div className="flex items-center gap-3 px-4 border-l-4 border-orange-500 bg-white/5 py-2 md:py-3 rounded-r-2xl">
                    <Trophy className="h-5 w-5 md:h-6 md:w-6 text-orange-500" />
                    <h4 className="font-headline text-xs md:text-sm uppercase tracking-widest text-white">Очки за места</h4>
                </div>
                <div className="grid gap-2 md:gap-3">
                    {renderHelpPill('1 МЕСТО', s.pointsFor1st, Medal, 'text-gold')}
                    {renderHelpPill('2 МЕСТО', s.pointsFor2nd, Medal, 'text-silver')}
                    {renderHelpPill('3-4 МЕСТА', s.pointsFor3rd_4th, Medal, 'text-bronze')}
                    {renderHelpPill('5-8 МЕСТА', s.pointsFor5th_8th, Target, 'text-primary')}
                    {renderHelpPill('9-16 МЕСТА', s.pointsFor9th_16th, TrendingUp, 'text-primary/60')}
                    {renderHelpPill('УЧАСТИЕ', s.participationPoints, Users, 'text-muted-foreground')}
                </div>
            </div>

            <div className="space-y-4 md:space-y-6">
                <div className="flex items-center gap-3 px-4 border-l-4 border-cyan-400 bg-white/5 py-2 md:py-3 rounded-r-2xl">
                    <Star className="h-5 w-5 md:h-6 md:w-6 text-cyan-400" />
                    <h4 className="font-headline text-xs md:text-sm uppercase tracking-widest text-white">Бонусы статистики</h4>
                </div>
                <div className="grid gap-2 md:gap-3">
                    {s.enable180Bonus && renderHelpPill('MAX 180', `+${s.bonusPer180}`, Sparkles, 'text-orange-400', 'За каждый максимум')}
                    {s.enableHiOutBonus && renderHelpPill(`HI-OUT ≥ ${s.hiOutThreshold}`, `+${s.hiOutBonus}`, Zap, 'text-yellow-400', 'Высокое закрытие')}
                    {s.enableAvgBonus && renderHelpPill(`AVG ≥ ${s.avgThreshold}`, `+${s.avgBonus}`, TrendingUp, 'text-cyan-400', 'Средний набор')}
                    {s.enableShortLegBonus && renderHelpPill(`ЛЕГ ≤ ${s.shortLegThreshold}`, `+${s.shortLegBonus}`, Flame, 'text-rose-500', 'Короткий лег')}
                    {s.enable9DarterBonus && renderHelpPill('9-DARTER', `+${s.bonusFor9Darter}`, Star, 'text-purple-400', 'Идеальный лег')}
                    
                    {!(s.enable180Bonus || s.enableHiOutBonus || s.enableAvgBonus || s.enableShortLegBonus || s.enable9DarterBonus) && (
                        <div className="flex flex-col items-center justify-center p-8 md:p-12 border-2 border-dashed border-white/5 rounded-[2rem] md:rounded-[2.5rem] opacity-30">
                            <Zap className="h-8 w-8 md:h-10 md:w-10 mb-4" />
                            <p className="text-[10px] md:text-xs uppercase font-bold tracking-widest text-center leading-relaxed">Дополнительные бонусы<br/>в данной лиге не активны</p>
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
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-primary/10 transition-colors">
            <Trophy className="text-primary h-5 w-5" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="glassmorphism max-w-5xl p-0 overflow-hidden border-white/10 rounded-[2rem] md:rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.9)] bg-[#050505] w-[95vw] md:w-full max-h-[90vh] flex flex-col">
        
        <DialogHeader className="bg-gradient-to-b from-white/5 to-transparent pt-8 md:pt-12 pb-10 md:pb-16 px-6 md:px-8 relative items-center text-center shrink-0">
            <Button onClick={() => setOpen(false)} asChild variant="ghost" size="icon" className="absolute left-4 md:left-8 top-4 md:top-8 h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl hover:bg-white/10 z-20 transition-all active:scale-95 shadow-xl border border-white/5">
                <Link href="/">
                    <Home className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </Link>
            </Button>

            <DialogClose className="absolute right-4 md:right-8 top-4 md:top-8 h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl hover:bg-red-500/20 hover:text-red-500 transition-all z-20 flex items-center justify-center border border-white/5 active:scale-95 group">
                <X className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground group-hover:scale-110 transition-transform" />
            </DialogClose>
            
            <DialogTitle className="flex flex-col items-center">
                <span className="text-3xl md:text-7xl uppercase font-headline tracking-tighter text-white text-glow drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] mb-1 md:mb-2">Регламент</span>
                <div className="flex items-center gap-3 md:gap-4">
                    <div className="h-px w-6 md:w-16 bg-gradient-to-r from-transparent to-primary" />
                    <span className="text-[8px] md:text-xs font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] text-primary drop-shadow-[0_0_10px_currentColor]">Официальные правила</span>
                    <div className="h-px w-6 md:w-16 bg-gradient-to-l from-transparent to-primary" />
                </div>
            </DialogTitle>
        </DialogHeader>

        <div className="p-0 flex flex-col flex-1 overflow-hidden">
            <Tabs 
                defaultValue={settingsArray[0]?.id || "general"} 
                className="w-full flex flex-col h-full"
            >
                {/* Bookshelf Navigation - Mobile optimized scroll */}
                <div className="relative z-20 -mt-6 md:-mt-10 mb-6 md:mb-12 shrink-0">
                    <div className="w-full px-4 overflow-x-auto no-scrollbar mask-fade-edges">
                        <TabsList className="bg-black/60 backdrop-blur-3xl p-2 md:p-4 border border-white/10 h-auto flex flex-nowrap md:grid md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 md:gap-3 mx-auto w-max md:w-fit rounded-2xl md:rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                            {settingsArray.map((s, idx) => {
                                const id = s.id || 'general';
                                const Icon = leagueIcons[id] || Trophy;
                                const style = leagueBookStyles[id] || leagueBookStyles.general;
                                return (
                                    <TabsTrigger 
                                        key={idx} 
                                        value={id} 
                                        className={cn(
                                            "relative flex flex-col items-center justify-center w-14 h-16 sm:w-18 sm:h-20 md:w-24 md:h-28 rounded-lg md:rounded-xl border-2 transition-all duration-500 shrink-0",
                                            "bg-gradient-to-br shadow-2xl overflow-hidden",
                                            "data-[state=active]:-translate-y-1 md:data-[state=active]:-translate-y-2 data-[state=active]:scale-105 md:data-[state=active]:scale-110 data-[state=active]:border-white data-[state=active]:z-10",
                                            "data-[state=inactive]:opacity-40 data-[state=inactive]:grayscale data-[state=inactive]:scale-95 data-[state=inactive]:hover:opacity-100 data-[state=inactive]:hover:grayscale-0",
                                            style
                                        )}
                                    >
                                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <Icon className="h-4 w-4 md:h-7 md:w-7 mb-1 md:mb-2 text-white drop-shadow-lg" />
                                        <span className="text-[7px] md:text-[9px] font-black uppercase tracking-tighter text-white text-center leading-tight px-1 drop-shadow-md line-clamp-2">
                                            {namesArray[idx] || 'Лига'}
                                        </span>
                                        <div className="absolute left-0.5 top-1/4 bottom-1/4 w-0.5 bg-white/20 rounded-full" />
                                    </TabsTrigger>
                                )
                            })}
                        </TabsList>
                    </div>
                </div>

                <ScrollArea className="flex-1 px-4 md:px-16 pb-8 md:pb-16">
                    {settingsArray.map((s, idx) => (
                        <TabsContent key={idx} value={s.id || 'general'} className="outline-none animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="flex items-center gap-4 mb-6 md:mb-8">
                                <h3 className="text-xl md:text-4xl font-headline uppercase tracking-tighter text-white/90">
                                    {namesArray[idx]}
                                </h3>
                                <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent" />
                            </div>
                            {renderLeagueContent(s)}
                        </TabsContent>
                    ))}
                </ScrollArea>
            </Tabs>
        </div>

        <div className="bg-black/80 backdrop-blur-2xl p-6 md:p-8 border-t border-white/5 shrink-0">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8">
            <div className="flex items-center gap-4 md:gap-5">
                <div className="h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center font-headline text-primary text-lg md:text-xl shadow-2xl shadow-primary/10 ring-2 md:ring-4 ring-primary/5">D</div>
                <div className="flex flex-col">
                    <p className="text-xs md:text-sm text-white font-black uppercase tracking-[0.2em] md:tracking-[0.3em] leading-none mb-1">DartBrig Pro Core</p>
                    <div className="flex items-center gap-2">
                        <span className="h-1 w-1 md:h-1.5 md:w-1.5 rounded-full bg-primary animate-pulse" />
                        <p className="text-[8px] md:text-[10px] text-primary/80 font-bold uppercase tracking-widest">v2.6 Stable • Enterprise Edition</p>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
                <Button onClick={() => setOpen(false)} asChild variant="outline" className="w-full md:w-auto rounded-xl md:rounded-2xl font-bold uppercase tracking-widest text-[9px] md:text-[11px] h-12 md:h-14 px-6 md:px-8 gap-3 border-white/10 hover:bg-primary hover:text-primary-foreground hover:border-primary shadow-2xl transition-all active:scale-95 group">
                    <Link href="/">
                        <Home className="h-4 w-4 md:h-5 md:w-5" />
                        Закрыть регламент
                        <ChevronRight className="h-3 w-3 md:h-4 md:w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </Link>
                </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}