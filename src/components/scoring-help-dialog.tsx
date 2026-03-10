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
    Shield, 
    Award, 
    Star, 
    Users, 
    Baby, 
    PersonStanding, 
    CircleHelp, 
    Moon, 
    X, 
    Zap, 
    Target, 
    TrendingUp, 
    Medal, 
    Flame, 
    Sparkles,
    Wallet,
    Home
} from 'lucide-react';
import type { ScoringSettings, LeagueId, SponsorshipSettings } from '@/lib/types';
import { ScrollArea, ScrollBar } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

/**
 * @fileOverview Окно регламента очков.
 * ГАРАНТИЯ: Мгновенный переход на главную при клике на вкладку лиги.
 */

interface ScoringHelpDialogProps {
  settings: ScoringSettings | ScoringSettings[];
  leagueName: string | string[];
  sponsorshipSettings: SponsorshipSettings;
  children?: ReactNode;
}

const leagueIcons: Record<string, any> = {
    general: Trophy,
    premier: Shield,
    first: Award,
    cricket: Star,
    senior: Users,
    youth: Baby,
    women: PersonStanding,
    evening_omsk: Moon,
};

const leagueColorMap: Record<string, string> = {
    general: 'data-[state=active]:bg-cyan-500 text-cyan-400',
    evening_omsk: 'data-[state=active]:bg-orange-500 text-orange-400',
    premier: 'data-[state=active]:bg-blue-500 text-blue-400',
    first: 'data-[state=active]:bg-amber-500 text-amber-400',
    cricket: 'data-[state=active]:bg-emerald-500 text-emerald-400',
    second: 'data-[state=active]:bg-sky-500 text-sky-400',
    third: 'data-[state=active]:bg-indigo-500 text-indigo-400',
    fourth: 'data-[state=active]:bg-purple-500 text-purple-400',
    senior: 'data-[state=active]:bg-blue-500 text-blue-400',
    youth: 'data-[state=active]:bg-lime-500 text-lime-400',
    women: 'data-[state=active]:bg-indigo-500 text-indigo-400',
};

const getLeagueColor = (id?: string) => leagueColorMap[id || 'general'] || leagueColorMap.general;

export function ScoringHelpDialog({ settings, leagueName, children }: ScoringHelpDialogProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const settingsArray = Array.isArray(settings) ? settings : [settings];
  const namesArray = Array.isArray(leagueName) ? leagueName : [leagueName];

  const handleValueChange = (value: string) => {
    // При выборе другой лиги в справке — закрываем окно и переходим на главную к этой лиге
    setOpen(false);
    router.push(`/?league=${value}`);
  };

  if (!mounted) return children || null;

  const renderHelpPill = (label: string, val: string | number, Icon: any, colorClass: string, description?: string) => (
    <div className="flex items-center justify-between py-2.5 md:py-4 px-4 md:px-6 rounded-xl md:rounded-full bg-black/40 border border-white/5 hover:border-primary/40 transition-all group shadow-sm interactive-scale">
        <div className="flex items-center gap-2.5 md:gap-4 min-w-0">
            <div className={cn("p-1.5 md:p-2 rounded-full bg-white/5 border border-white/5", colorClass)}>
                <Icon className="h-3 w-3 md:h-4 md:w-4" />
            </div>
            <div className="flex flex-col min-w-0">
                <span className="text-[9px] md:text-[11px] font-bold text-white uppercase tracking-widest truncate leading-tight">{label}</span>
                {description && (
                    <span className="text-[7px] md:text-[9px] text-muted-foreground/60 font-bold uppercase tracking-tight truncate mt-0.5">{description}</span>
                )}
            </div>
        </div>
        <span className="text-lg md:text-2xl font-headline text-orange-500 ml-2 md:ml-4 drop-shadow-[0_0_10px_rgba(249,115,22,0.3)] shrink-0">{val}</span>
    </div>
  );

  const renderLeagueContent = (s: ScoringSettings) => {
    if (s.isEveningOmsk) {
        return (
            <div className="flex flex-col gap-4 md:gap-6 pt-2 md:pt-4">
                <div className="p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] bg-orange-500/10 border border-orange-500/20 space-y-3 md:space-y-4">
                    <div className="flex items-center gap-3 mb-1">
                        <Moon className="text-orange-500 h-4 w-4 md:h-5 md:w-5" />
                        <h4 className="font-headline text-xs md:text-sm uppercase tracking-widest text-orange-400">Механика «Вечерний Омск»</h4>
                    </div>
                    <p className="text-[10px] md:text-xs text-muted-foreground leading-relaxed">
                        Баллы основаны на AVG и стадии плей-офф. Актуальные множители:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                        {renderHelpPill('1 МЕСТО', `AVG × ${s.pointsFor1st?.toFixed(2) || '1.00'}`, Medal, 'text-gold')}
                        {renderHelpPill('2 МЕСТО', `AVG × ${s.pointsFor2nd?.toFixed(2) || '0.70'}`, Medal, 'text-silver')}
                        {renderHelpPill('1/2 ФИНАЛА', `AVG × ${s.pointsFor3rd_4th?.toFixed(2) || '0.50'}`, Medal, 'text-bronze')}
                        {renderHelpPill('1/4 ФИНАЛА', `AVG × ${s.pointsFor5th_8th?.toFixed(2) || '0.25'}`, Target, 'text-primary')}
                    </div>
                </div>
                <div className="p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex items-center gap-3 mb-3 md:mb-4">
                        <Wallet className="text-emerald-500 h-4 w-4 md:h-5 md:w-5" />
                        <h4 className="font-headline text-xs md:text-sm uppercase tracking-widest text-emerald-400">Призовые</h4>
                    </div>
                    <p className="text-[10px] md:text-xs text-muted-foreground leading-relaxed">
                        Курс сезона: <span className="text-white font-bold">1 балл = {s.exchangeRate || 7} ₽</span>. 
                        В финал выходят ТОП-16 игроков. Обналичиваются баллы за 5 лучших выступлений.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 lg:gap-8 pt-2 md:pt-4">
            <div className="space-y-3 md:space-y-4">
                <div className="flex items-center gap-3 px-2 mb-1">
                    <Trophy className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                    <h4 className="font-headline text-[10px] md:text-xs uppercase tracking-widest text-white/70">Очки за места</h4>
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

            <div className="space-y-3 md:space-y-4 mt-2 lg:mt-0">
                <div className="flex items-center gap-3 px-2 mb-1">
                    <Star className="h-4 w-4 md:h-5 md:w-5 text-cyan-400" />
                    <h4 className="font-headline text-[10px] md:text-xs uppercase tracking-widest text-white/70">Бонусные баллы</h4>
                </div>
                <div className="grid gap-2 md:gap-3">
                    {s.enable180Bonus && renderHelpPill('БОНУС ЗА 180', `+${s.bonusPer180}`, Sparkles, 'text-orange-400', 'За каждый максимум')}
                    {s.enableHiOutBonus && renderHelpPill(`HI-OUT ≥ ${s.hiOutThreshold}`, `+${s.hiOutBonus}`, Zap, 'text-yellow-400', 'Высокое закрытие')}
                    {s.enableAvgBonus && renderHelpPill(`AVG ≥ ${s.avgThreshold}`, `+${s.avgBonus}`, TrendingUp, 'text-cyan-400', 'Средний набор')}
                    {s.enableShortLegBonus && renderHelpPill(`ЛЕГ ≤ ${s.shortLegThreshold}`, `+${s.shortLegBonus}`, Flame, 'text-rose-500', 'Короткий лег')}
                    {s.enable9DarterBonus && renderHelpPill('9-DARTER', `+${s.bonusFor9Darter}`, Star, 'text-purple-400', 'Идеальный лег')}
                    
                    {!(s.enable180Bonus || s.enableHiOutBonus || s.enableAvgBonus || s.enableShortLegBonus || s.enable9DarterBonus) && (
                        <div className="flex items-center justify-center p-6 md:p-8 border-2 border-dashed border-white/5 rounded-xl md:rounded-[2rem] opacity-40">
                            <p className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest text-center leading-relaxed">Бонусы для этой лиги<br/>не предусмотрены</p>
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
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <CircleHelp className="text-primary h-5 w-5" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="glassmorphism max-w-4xl p-0 overflow-hidden border-white/10 rounded-[1.5rem] md:rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.8)] bg-black w-[95vw] md:w-full">
        
        <DialogHeader className="bg-black/60 pt-6 md:pt-10 pb-8 md:pb-12 px-4 md:px-8 relative items-center text-center">
            <Button onClick={() => setOpen(false)} asChild variant="ghost" size="icon" className="absolute left-3 md:left-6 top-3 md:top-6 h-10 w-10 rounded-full hover:bg-white/10 z-20 interactive-scale" title="На главную">
                <Link href="/">
                    <Home className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                </Link>
            </Button>

            <DialogClose className="absolute right-3 md:right-6 top-3 md:top-6 p-2 rounded-full hover:bg-white/10 transition-colors z-20">
                <X className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
            </DialogClose>
            
            <DialogTitle className="flex flex-col items-center gap-2 md:gap-4">
                <span className="text-xl md:text-5xl uppercase font-headline tracking-tighter text-glow drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">Регламент очков</span>
                <span className="text-[8px] md:text-sm font-bold uppercase tracking-[0.2em] md:tracking-[0.4em] text-muted-foreground opacity-80">Правила начисления баллов лиги</span>
            </DialogTitle>
        </DialogHeader>

        <div className="bg-black p-0 flex flex-col">
            <Tabs 
                defaultValue={settingsArray[0]?.id || "general"} 
                className="w-full"
                onValueChange={handleValueChange}
            >
                <div className="flex flex-col items-center -mt-4 md:-mt-8 mb-4 md:mb-8 relative z-20">
                    <div className="w-full max-w-full px-2 md:px-4">
                        <ScrollArea className="w-full whitespace-nowrap mask-fade-edges">
                            <TabsList className="bg-black/90 p-1 border border-white/10 rounded-full h-auto flex gap-1 shadow-2xl mx-auto w-fit">
                                {settingsArray.map((s, idx) => {
                                    const id = s.id || 'general';
                                    const Icon = leagueIcons[id] || Trophy;
                                    const colorClass = getLeagueColor(id);
                                    return (
                                        <TabsTrigger 
                                            key={idx} 
                                            value={id} 
                                            className={cn(
                                                "gap-1.5 md:gap-2 px-3 md:px-8 py-1.5 md:py-3 rounded-full text-[8px] md:text-[11px] font-bold uppercase tracking-widest transition-all data-[state=active]:text-black whitespace-nowrap active:scale-95",
                                                colorClass
                                            )}
                                        >
                                            <Icon className="h-3 w-3 md:h-4 md:w-4 shrink-0" />
                                            <span>{namesArray[idx] || 'Лига'}</span>
                                        </TabsTrigger>
                                    )
                                })}
                            </TabsList>
                            <ScrollBar orientation="horizontal" className="hidden" />
                        </ScrollArea>
                    </div>
                </div>

                <ScrollArea className="max-h-[80vh] md:max-h-[55vh] px-4 md:px-12 pb-20 md:pb-12">
                    {settingsArray.map((s, idx) => (
                        <TabsContent key={idx} value={s.id || 'general'} className="outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
                            {renderLeagueContent(s)}
                        </TabsContent>
                    ))}
                </ScrollArea>
            </Tabs>
        </div>

        <div className="bg-black p-4 md:p-8 border-t border-white/5">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 md:gap-6">
            <div className="flex items-center gap-3 md:gap-4">
                <div className="h-7 md:h-10 w-7 md:w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-headline text-primary text-[10px] md:text-sm shadow-inner shadow-primary/20">N</div>
                <div className="flex flex-col">
                    <p className="text-[8px] md:text-[11px] text-muted-foreground uppercase font-black tracking-[0.2em] md:tracking-[0.3em] leading-none">DartBrig Pro Core</p>
                    <p className="text-[7px] md:text-[9px] text-primary/60 font-bold uppercase tracking-widest mt-1">version 2.6 build stable</p>
                </div>
            </div>
            
            <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto">
                <Button onClick={() => setOpen(false)} asChild variant="outline" className="rounded-xl font-bold uppercase tracking-widest text-[8px] md:text-[10px] h-9 md:h-10 flex-1 sm:flex-none px-4 md:px-6 gap-2 border-white/10 hover:bg-white/5 interactive-scale">
                    <Link href="/">
                        <Home className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        На главную
                    </Link>
                </Button>
                <div className="hidden sm:flex flex-col gap-1 text-[8px] md:text-[10px] text-muted-foreground font-bold uppercase tracking-wider opacity-40 text-right">
                    <p>разраб. Рядченко А. Андякин К.</p>
                    <p>тест. Онищук С.</p>
                </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
