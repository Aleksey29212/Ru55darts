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
    CircleUser,
    ListOrdered,
    History
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
    <div className="flex items-center justify-between py-3 px-4 rounded-2xl bg-white/[0.04] border border-white/5 hover:border-primary/40 transition-all group shadow-sm active:scale-[0.98]">
        <div className="flex items-center gap-3 min-w-0">
            <div className={cn("p-2 rounded-xl bg-black/40 border border-white/5 shrink-0 shadow-inner", colorClass)}>
                <Icon className="h-4 w-4" />
            </div>
            <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-black text-white uppercase tracking-tight truncate leading-none">{label}</span>
                {description && (
                    <span className="text-[8px] text-muted-foreground font-bold uppercase tracking-tight truncate mt-1 opacity-50">{description}</span>
                )}
            </div>
        </div>
        <span className="text-lg md:text-xl font-headline text-primary ml-2 drop-shadow-[0_0_12px_rgba(var(--primary-rgb),0.6)] shrink-0 min-w-[35px] text-right">{val}</span>
    </div>
  );

  const renderLeagueContent = (s: ScoringSettings) => {
    if (s.isEveningOmsk) {
        return (
            <div className="flex flex-col gap-4 pt-2 pb-12">
                <div className="p-5 rounded-[2rem] bg-gradient-to-br from-orange-500/15 to-orange-950/30 border border-orange-500/20 space-y-4 relative overflow-hidden group shadow-2xl">
                    <div className="absolute -top-10 -right-10 opacity-5 group-hover:scale-110 transition-transform duration-[5s]">
                        <Moon className="h-32 w-32 md:h-48 md:w-48 text-orange-500" />
                    </div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="p-2 bg-orange-500/20 rounded-xl shadow-xl border border-orange-500/30">
                            <Sparkles className="text-orange-400 h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                            <h4 className="font-headline text-sm uppercase tracking-tight text-orange-400">Система множителей</h4>
                            <p className="text-[8px] uppercase font-black text-orange-300/40 tracking-widest">Вечерний Омск • Динамический расчет</p>
                        </div>
                    </div>
                    <div className="bg-black/60 p-3 rounded-xl border border-white/5 relative z-10 shadow-inner">
                        <p className="text-xs text-white/80 leading-relaxed font-medium">
                            Итоговые баллы вычисляются по формуле: <span className="text-orange-400 font-black text-sm text-glow">AVG × Множитель этапа</span>
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 relative z-10">
                        {renderHelpPill('Победитель', `× 1.00`, Medal, 'text-gold', '1-е место')}
                        {renderHelpPill('Финалист', `× 0.70`, Medal, 'text-silver', '2-е место')}
                        {renderHelpPill('1/2 финала', `× 0.50`, Medal, 'text-bronze', 'Полуфинал')}
                        {renderHelpPill('1/4 финала', `× 0.25`, Target, 'text-primary', 'Четвертьфинал')}
                    </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-[1.5rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-4 shadow-xl">
                        <div className="bg-emerald-500/20 p-2 rounded-xl border border-emerald-500/20 shadow-inner"><Wallet className="text-emerald-400 h-5 w-5" /></div>
                        <div className="text-left">
                            <h4 className="font-headline text-[10px] uppercase tracking-widest text-emerald-400">Курс балла</h4>
                            <p className="text-xl text-white font-black">{s.exchangeRate || 7} ₽</p>
                        </div>
                    </div>
                    <div className="p-4 rounded-[1.5rem] bg-blue-500/10 border border-blue-500/20 flex items-center gap-4 shadow-xl">
                        <div className="bg-blue-500/20 p-2 rounded-xl border border-blue-500/20 shadow-inner"><Award className="text-blue-400 h-5 w-5" /></div>
                        <div className="text-left">
                            <h4 className="font-headline text-[10px] uppercase tracking-widest text-blue-400">Суперфинал</h4>
                            <p className="text-xl text-white font-black">ТОП-16</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 pt-2 pb-20">
            <div className="space-y-3">
                <div className="flex items-center gap-3 px-4 border-l-4 border-orange-500 bg-white/5 py-2 rounded-r-2xl shadow-xl">
                    <Trophy className="h-4 w-4 text-orange-500" />
                    <h4 className="font-headline text-[11px] uppercase tracking-widest text-white leading-none">Баллы за итоговые места</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {renderHelpPill('1 МЕСТО', s.pointsFor1st, Medal, 'text-gold', 'Победа')}
                    {renderHelpPill('2 МЕСТО', s.pointsFor2nd, Medal, 'text-silver', 'Финал')}
                    {renderHelpPill('3-4 МЕСТА', s.pointsFor3rd_4th, Medal, 'text-bronze', 'Полуфинал')}
                    {renderHelpPill('5-8 МЕСТА', s.pointsFor5th_8th, Target, 'text-primary', '1/4 финала')}
                    {renderHelpPill('9-16 МЕСТА', s.pointsFor9th_16th, TrendingUp, 'text-primary/60', '1/8 финала')}
                    {renderHelpPill('УЧАСТИЕ', s.participationPoints, Users, 'text-muted-foreground', 'Групповой этап')}
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center gap-3 px-4 border-l-4 border-cyan-400 bg-white/5 py-2 rounded-r-2xl shadow-xl">
                    <Star className="h-4 w-4 text-cyan-400" />
                    <h4 className="font-headline text-[11px] uppercase tracking-widest text-white leading-none">Бонусные начисления</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {s.enable180Bonus && renderHelpPill('MAX 180', `+${s.bonusPer180}`, Sparkles, 'text-orange-400', 'За каждый 180')}
                    {s.enableHiOutBonus && renderHelpPill(`HI-OUT ≥ ${s.hiOutThreshold}`, `+${s.hiOutBonus}`, Zap, 'text-yellow-400', 'Высокое закрытие')}
                    {s.enableAvgBonus && renderHelpPill(`AVG ≥ ${s.avgThreshold}`, `+${s.avgBonus}`, TrendingUp, 'text-cyan-400', 'Высокий средний')}
                    {s.enableShortLegBonus && renderHelpPill(`ЛЕГ ≤ ${s.shortLegThreshold}`, `+${s.shortLegBonus}`, Flame, 'text-rose-500', 'Скоростной лег')}
                    {s.enable9DarterBonus && renderHelpPill('9-DARTER', `+${s.bonusFor9Darter}`, Star, 'text-purple-400', 'Идеальный лег')}
                    
                    {!(s.enable180Bonus || s.enableHiOutBonus || s.enableAvgBonus || s.enableShortLegBonus || s.enable9DarterBonus) && (
                        <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-white/5 rounded-3xl opacity-30 bg-black/20 col-span-full">
                            <Zap className="h-6 w-6 text-muted-foreground mb-2" />
                            <p className="text-[10px] uppercase font-black tracking-widest">Дополнительные бонусы отсутствуют</p>
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
      <DialogContent className="glassmorphism max-w-4xl p-0 overflow-hidden border-white/10 rounded-[2.5rem] shadow-[0_0_120px_rgba(0,0,0,1)] bg-[#050505] w-[96vw] md:w-full h-[92dvh] max-h-[92dvh] flex flex-col transition-all duration-500">
        
        <DialogHeader className="bg-gradient-to-b from-white/5 to-transparent pt-4 pb-4 px-6 relative items-center text-center shrink-0 border-b border-white/10">
            <Button onClick={() => setOpen(false)} asChild variant="ghost" size="icon" className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl hover:bg-white/5 z-20 transition-all shadow-xl border border-white/5">
                <Link href="/">
                    <Home className="h-5 w-5 text-primary" />
                </Link>
            </Button>

            <DialogClose className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all z-20 flex items-center justify-center border border-white/5 group">
                <X className="h-5 w-5 text-muted-foreground group-hover:scale-110 transition-transform" />
            </DialogClose>
            
            <DialogTitle className="flex flex-col items-center">
                <span className="text-lg md:text-2xl uppercase font-headline tracking-tighter text-white text-glow leading-none">Регламент</span>
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 mt-1.5">Официальные правила</span>
            </DialogTitle>
        </DialogHeader>

        <div className="p-0 flex flex-col flex-1 overflow-hidden relative">
            <Tabs 
                defaultValue={settingsArray[0]?.id || "general"} 
                className="w-full flex flex-col h-full"
            >
                {/* Фиксированная панель навигации */}
                <div className="relative z-20 shrink-0 px-4 md:px-8 mt-4 mb-2">
                    <div className="w-full overflow-x-auto no-scrollbar mask-fade-edges pb-2">
                        <TabsList className="bg-black/80 backdrop-blur-3xl p-1.5 border border-white/10 h-auto flex flex-nowrap md:grid md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 mx-auto w-max md:w-full rounded-2xl shadow-2xl">
                            {settingsArray.map((s, idx) => {
                                const id = s.id || 'general';
                                const Icon = leagueIcons[id] || Trophy;
                                const style = leagueBookStyles[id] || leagueBookStyles.general;
                                return (
                                    <TabsTrigger 
                                        key={idx} 
                                        value={id} 
                                        className={cn(
                                            "relative flex flex-col items-center justify-center w-14 h-14 md:w-full md:h-14 rounded-xl border-2 transition-all duration-500 shrink-0 shadow-lg",
                                            "bg-gradient-to-br overflow-hidden",
                                            "data-[state=active]:-translate-y-1.5 data-[state=active]:scale-105 data-[state=active]:border-white/60 data-[state=active]:z-10 data-[state=active]:shadow-2xl",
                                            "data-[state=inactive]:opacity-30 data-[state=inactive]:grayscale-[0.6] data-[state=inactive]:hover:opacity-100",
                                            style
                                        )}
                                    >
                                        <Icon className="h-4 w-4 md:h-5 md:w-5 mb-1 text-white drop-shadow-md" />
                                        <span className="text-[6px] md:text-[7px] font-black uppercase tracking-tight text-white text-center leading-none px-1 line-clamp-1">
                                            {namesArray[idx] || 'Лига'}
                                        </span>
                                    </TabsTrigger>
                                )
                            })}
                            
                            {/* Новая вкладка ранжирования */}
                            <TabsTrigger 
                                value="ranking-logic"
                                className="relative flex flex-col items-center justify-center w-14 h-14 md:w-full md:h-14 rounded-xl border-2 transition-all duration-500 shrink-0 shadow-lg bg-gradient-to-br from-indigo-600 to-purple-900 border-indigo-400/50 data-[state=active]:-translate-y-1.5 data-[state=active]:scale-105 data-[state=active]:border-white/60"
                            >
                                <ListOrdered className="h-4 w-4 md:h-5 md:w-5 mb-1 text-white" />
                                <span className="text-[6px] md:text-[7px] font-black uppercase tracking-tight text-white">МЕСТА</span>
                            </TabsTrigger>
                        </TabsList>
                    </div>
                </div>

                {/* Основная область прокрутки (Лента) */}
                <ScrollArea className="flex-1 px-4 md:px-12 lg:px-20 scroll-smooth">
                    <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[#050505] to-transparent z-10 pointer-events-none" />
                    
                    {settingsArray.map((s, idx) => (
                        <TabsContent key={idx} value={s.id || 'general'} className="outline-none animate-in fade-in slide-in-from-bottom-4 duration-700 mt-0">
                            <div className="flex items-center gap-4 mb-4 mt-6">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                <h3 className="text-sm md:text-lg font-headline uppercase tracking-tight text-white/95 text-glow-white">
                                    {namesArray[idx]}
                                </h3>
                                <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent" />
                            </div>
                            
                            {/* Рендеринг содержимого ленты */}
                            {renderLeagueContent(s)}
                        </TabsContent>
                    ))}

                    {/* Контент вкладки Ранжирования */}
                    <TabsContent value="ranking-logic" className="outline-none animate-in fade-in slide-in-from-bottom-4 duration-700 mt-0">
                        <div className="flex items-center gap-4 mb-4 mt-6">
                            <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                            <h3 className="text-sm md:text-lg font-headline uppercase tracking-tight text-white/95 text-glow-white">
                                Основа распределения мест в лигах
                            </h3>
                            <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent" />
                        </div>

                        <div className="space-y-3 pb-20">
                            {renderHelpPill('1. Сумма баллов', 'Основа', Trophy, 'text-gold', 'Главный критерий. Суммируются все очки за места и заработанные бонусы.')}
                            {renderHelpPill('2. Средний набор (AVG)', 'Набор', Zap, 'text-yellow-400', 'При равных баллах выше стоит игрок с более высоким качеством игры.')}
                            {renderHelpPill('3. Max Out (Hi-Out)', 'Финиш', Target, 'text-pink-500', 'Если баллы и AVG равны, учитывается хладнокровие на решающем закрытии.')}
                            {renderHelpPill('4. Количество 180-к', 'Снайпер', Star, 'text-orange-500', 'Следующий этап отбора — частота попадания всеми дротиками в утроение 20.')}
                            {renderHelpPill('5. Количество турниров', 'Опыт', History, 'text-blue-400', 'При полном равенстве выше стоит игрок, принявший участие в большем числе туров.')}
                            
                            <div className="p-6 rounded-[2rem] bg-indigo-500/10 border border-indigo-500/20 mt-6 shadow-2xl">
                                <p className="text-xs text-indigo-200/80 leading-relaxed italic font-medium">
                                    Данная многоуровневая система (tie-breakers) гарантирует максимально честное и прозрачное распределение позиций в таблице лидеров DartBrig Pro.
                                </p>
                            </div>
                        </div>
                    </TabsContent>
                    
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#050505] to-transparent z-10 pointer-events-none" />
                </ScrollArea>
            </Tabs>
        </div>

        {/* Компактный подвал */}
        <div className="bg-black/98 backdrop-blur-3xl p-3 px-8 border-t border-white/10 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
          <div className="flex flex-row justify-between items-center gap-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center font-headline text-primary text-xs shadow-inner">D</div>
                <div className="flex flex-col">
                    <p className="text-[10px] text-white font-black uppercase tracking-widest leading-none">DartBrig Pro</p>
                    <p className="text-[7px] text-primary/50 font-bold uppercase tracking-[0.3em] mt-1">v2.8 Stable • Regulations Update</p>
                </div>
            </div>
            
            <Button onClick={() => setOpen(false)} asChild variant="outline" className="rounded-xl font-black uppercase tracking-widest text-[9px] h-10 px-8 gap-3 border-white/10 bg-white/5 hover:bg-primary hover:text-primary-foreground transition-all shadow-xl active:scale-95">
                <Link href="/">
                    <Home className="h-4 w-4 text-primary group-hover:text-white" />
                    <span>ЗАКРЫТЬ</span>
                    <ChevronRight className="h-4 w-4 opacity-50" />
                </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
