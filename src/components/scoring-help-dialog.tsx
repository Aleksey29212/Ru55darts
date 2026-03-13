'use client';

import { useState, useEffect, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
    Trophy, 
    ShieldCheck, 
    Award, 
    Star, 
    Users, 
    Baby, 
    Moon, 
    Zap, 
    Target, 
    Medal, 
    Sparkles,
    Wallet,
    Home,
    BarChart2,
    ChevronsUp,
    Diamond,
    CircleUser,
    ListOrdered,
    Crown,
    PlusCircle,
    Activity,
    ChevronRight
} from 'lucide-react';
import type { ScoringSettings, SponsorshipSettings, LeagueId } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import Link from 'next/link';
import { getPointsForRank } from '@/lib/scoring';

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
    fourth: 'from-purple-600 to-purple-900 border-pink-400/50',
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

  if (!mounted) return children || null;

  const settingsArray = (Array.isArray(settings) ? settings : [settings]).filter(s => s && typeof s === 'object');
  const namesArray = Array.isArray(leagueName) ? leagueName : [leagueName];

  const renderHelpPill = (label: string, val: string | number, Icon: any, colorClass: string, description?: string) => (
    <div key={label} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-white/[0.03] border border-white/5 hover:border-primary/30 transition-all group shadow-sm active:scale-[0.98]">
        <div className="flex items-center gap-2 min-w-0">
            <div className={cn("p-1 rounded-md bg-black/40 border border-white/5 shrink-0", colorClass)}>
                <Icon className="h-3.5 w-3.5" />
            </div>
            <div className="flex flex-col min-w-0">
                <span className="text-[10px] md:text-[11px] font-black text-white uppercase tracking-tight truncate leading-none">{label}</span>
                {description && (
                    <span className="text-[7px] md:text-[8px] text-muted-foreground font-bold uppercase tracking-tight truncate mt-0.5 opacity-50">{description}</span>
                )}
            </div>
        </div>
        <span className="text-xs md:text-sm font-headline text-primary ml-2 drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.4)] shrink-0 text-right">{val}</span>
    </div>
  );

  const renderLeagueContent = (s: ScoringSettings) => {
    if (s.isEveningOmsk) {
        return (
            <div className="flex flex-col gap-3 pt-1 pb-10">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500/10 to-black border border-orange-500/20 space-y-3 relative overflow-hidden group">
                    <div className="absolute -top-6 -right-6 opacity-5 group-hover:scale-110 transition-transform">
                        <Moon className="h-24 w-24 text-orange-500" />
                    </div>
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="p-1.5 bg-orange-500/20 rounded-lg border border-orange-500/30">
                            <Sparkles className="text-orange-400 h-4 w-4" />
                        </div>
                        <h4 className="font-headline text-xs md:text-sm uppercase tracking-tight text-orange-400">Множители этапов</h4>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 relative z-10">
                        {renderHelpPill('1-е', `× 1.00`, Medal, 'text-gold', 'Победа')}
                        {renderHelpPill('2-е', `× 0.70`, Medal, 'text-silver', 'Финал')}
                        {renderHelpPill('1/2', `× 0.50`, Medal, 'text-bronze', 'Полуфинал')}
                        {renderHelpPill('1/4', `× 0.25`, Target, 'text-primary', 'Четвертьфинал')}
                    </div>
                    <div className="p-3 bg-black/40 rounded-xl border border-white/5 mt-2 relative z-10">
                        <p className="text-[10px] md:text-[11px] text-white/80 leading-relaxed italic text-center">
                            <span className="text-primary font-bold">Формула:</span> AVG × Множитель. Баланс игрока — это сумма 5 лучших туров сезона, умноженная на курс рубля.
                        </p>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Wallet className="text-emerald-400 h-3.5 w-3.5" />
                            <span className="text-[9px] font-black uppercase text-emerald-400/70 tracking-widest">Курс балла</span>
                        </div>
                        <p className="text-sm text-white font-black">{s.exchangeRate || 7} ₽</p>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Award className="text-blue-400 h-3.5 w-3.5" />
                            <span className="text-[9px] font-black uppercase text-blue-400/70 tracking-widest">Финал</span>
                        </div>
                        <p className="text-sm text-white font-black">ТОП-16</p>
                    </div>
                </div>
            </div>
        );
    }

    const groupedRanks: { label: string, points: number, icon: any, color: string, desc: string }[] = [];
    let start = 1;
    while (start <= 16) {
        let end = start;
        const pts = getPointsForRank(start, s);
        
        while (end + 1 <= 16 && getPointsForRank(end + 1, s) === pts) {
            end++;
        }

        if (pts > 0) {
            const label = start === end ? `${start} МЕСТО` : `${start}-${end} МЕСТА`;
            let Icon = Award;
            let color = 'text-primary';
            let desc = start <= 2 ? 'Финалист' : (start <= 4 ? '1/2 финала' : (start <= 8 ? '1/4 финала' : '1/8 финала'));
            
            if (start === 1) { Icon = Medal; color = 'text-gold'; desc = 'Победа'; }
            else if (start === 2) { Icon = Medal; color = 'text-silver'; desc = 'Финал'; }
            else if (start === 3 && end === 3) { Icon = Medal; color = 'text-bronze'; desc = 'Бронза'; }

            groupedRanks.push({ label, points: pts, icon: Icon, color, desc });
        }
        start = end + 1;
    }

    const extraEntries = s.customPointsByPlace 
        ? Object.entries(s.customPointsByPlace)
            .filter(([place]) => Number(place) > 16)
            .sort((a, b) => Number(a[0]) - Number(b[0]))
        : [];

    return (
        <div className="flex flex-col gap-4 pt-1 pb-16">
            {s.participationPoints > 0 && (
                <div className="py-2.5 px-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between shadow-lg active:scale-95 transition-transform">
                    <div className="flex items-center gap-2">
                        <div className="p-1 rounded-md bg-black/40"><Sparkles className="h-4 w-4 text-primary" /></div>
                        <span className="text-[10px] md:text-[11px] font-black uppercase tracking-tight">Бонус за участие</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="font-headline text-lg md:text-xl text-primary">+{s.participationPoints}</span>
                        <span className="text-[6px] font-bold uppercase text-primary/60">ВСЕМ УЧАСТНИКАМ</span>
                    </div>
                </div>
            )}

            <div className="space-y-2">
                <div className="flex items-center gap-2 px-2 border-l-2 border-orange-500">
                    <Trophy className="h-4 w-4 text-orange-500" />
                    <h4 className="font-headline text-[9px] md:text-[11px] uppercase tracking-widest text-white/60">Базовые баллы (ТОП-16)</h4>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-1.5">
                    {groupedRanks.map((p, idx) => (
                        <div key={idx}>{renderHelpPill(p.label, p.points, p.icon, p.color, p.desc)}</div>
                    ))}
                </div>
            </div>

            {extraEntries.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center gap-3 px-3 border-l-2 border-purple-500">
                        <PlusCircle className="h-4 w-4 text-purple-500" />
                        <h4 className="font-headline text-[9px] md:text-[11px] uppercase tracking-widest text-white/60">Расширенная сетка</h4>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-1.5">
                        {extraEntries.map(([place, points]) => (
                            <div key={place}>{renderHelpPill(`${place} МЕСТО`, points, Medal, 'text-primary/40', 'Доп. позиция')}</div>
                        ))}
                    </div>
                </div>
            )}

            <div className="space-y-2">
                <div className="flex items-center gap-2 px-2 border-l-2 border-cyan-400">
                    <Star className="h-4 w-4 text-cyan-400" />
                    <h4 className="font-headline text-[9px] md:text-[11px] uppercase tracking-widest text-white/60">Про-статистика (Бонусы)</h4>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-1.5">
                    {s.enable180Bonus && renderHelpPill('180', `+${s.bonusPer180}`, Sparkles, 'text-orange-400', 'За каждый максимум')}
                    {s.enableHiOutBonus && renderHelpPill(`OUT ≥${s.hiOutThreshold}`, `+${s.hiOutBonus}`, Zap, 'text-yellow-400', 'Высокое закрытие')}
                    {s.enableAvgBonus && renderHelpPill(`AVG ≥${s.avgThreshold}`, `+${s.avgBonus}`, Activity, 'text-yellow-400', 'Мощный набор')}
                    {s.enableShortLegBonus && renderHelpPill(`SL ≤${s.shortLegThreshold}`, `+${s.shortLegBonus}`, Activity, 'text-cyan-400', 'Короткий лег')}
                    {s.enable9DarterBonus && renderHelpPill(`9-DARTER`, `+${s.bonusFor9Darter}`, Crown, 'text-primary', 'Идеальный лег')}
                </div>
            </div>
        </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/10 transition-all border border-white/5 shadow-xl active:scale-90">
            <Trophy className="text-primary h-5 w-5" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="glassmorphism max-w-2xl p-0 overflow-hidden border-white/10 rounded-[2rem] shadow-[0_0_100px_rgba(0,0,0,1)] bg-[#050505] w-[96vw] h-[85dvh] flex flex-col">
        
        <DialogHeader className="bg-gradient-to-b from-white/5 to-transparent pt-4 pb-3 px-6 relative items-center text-center shrink-0 border-b border-white/10">
            <Button onClick={() => setOpen(false)} asChild variant="ghost" size="icon" className="absolute left-4 top-1/2 -translate-y-1/2 h-9 w-9 rounded-xl hover:bg-white/5 z-20 shadow-xl border border-white/5 active:scale-90">
                <Link href="/">
                    <Home className="h-4 w-4 text-primary" />
                </Link>
            </Button>
            
            <DialogTitle className="flex flex-col items-center">
                <span className="text-lg uppercase font-headline tracking-tighter text-white leading-none">Регламент</span>
                <span className="text-[8px] font-black uppercase tracking-[0.4em] text-primary/60 mt-1">Официальные правила лиг</span>
            </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden relative">
            <Tabs 
                defaultValue={settingsArray[0]?.id || "general"} 
                className="w-full flex flex-col h-full"
            >
                <div className="relative z-20 shrink-0 px-4 mt-4 mb-2">
                    <TabsList className="bg-black/60 backdrop-blur-3xl p-1.5 border border-white/5 h-auto flex flex-wrap justify-center gap-1.5 rounded-xl mx-auto max-w-full overflow-x-auto no-scrollbar">
                        {settingsArray.map((s, idx) => {
                            const id = (s as any).id || 'general';
                            const Icon = leagueIcons[id] || Trophy;
                            const style = leagueBookStyles[id] || leagueBookStyles.general;
                            return (
                                <TabsTrigger 
                                    key={`tab-trigger-${id}-${idx}`} 
                                    value={id} 
                                    className={cn(
                                        "relative flex flex-col items-center justify-center w-16 h-12 md:w-20 md:h-14 rounded-lg border transition-all duration-300 active:scale-95",
                                        "bg-gradient-to-br overflow-hidden",
                                        "data-[state=active]:border-white/40 data-[state=active]:z-10 data-[state=active]:scale-105 shadow-2xl",
                                        "data-[state=inactive]:opacity-40 data-[state=inactive]:grayscale-[0.4]",
                                        style
                                    )}
                                >
                                    <Icon className="h-4 w-4 mb-0.5 text-white" />
                                    <span className="text-[6px] font-black uppercase tracking-tight text-white text-center leading-none px-0.5 line-clamp-1">
                                        {namesArray[idx] || 'Лига'}
                                    </span>
                                </TabsTrigger>
                            )
                        })}
                        
                        <TabsTrigger 
                            value="ranking-logic"
                            className="relative flex flex-col items-center justify-center w-16 h-12 md:w-20 md:h-14 rounded-lg border transition-all duration-300 bg-gradient-to-br from-indigo-600 to-purple-900 border-indigo-400/50 data-[state=active]:scale-105 data-[state=active]:border-white/40 active:scale-95"
                        >
                            <ListOrdered className="h-4 w-4 mb-0.5 text-white" />
                            <span className="text-[6px] font-black uppercase tracking-tight text-white">ЛОГИКА</span>
                        </TabsTrigger>
                    </TabsList>
                </div>

                <ScrollArea className="flex-1 px-6 scroll-smooth">
                    {settingsArray.map((s, idx) => (
                        <TabsContent key={`tab-content-${(s as any).id || idx}`} value={(s as any).id || 'general'} className="outline-none animate-in fade-in duration-500 mt-0">
                            <div className="flex items-center gap-3 mb-3 mt-4">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                <h3 className="text-sm font-headline uppercase tracking-tight text-white/90">
                                    {namesArray[idx]}
                                </h3>
                                <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                            </div>
                            {renderLeagueContent(s)}
                        </TabsContent>
                    ))}

                    <TabsContent value="ranking-logic" className="outline-none animate-in fade-in duration-500 mt-0">
                        <div className="flex items-center gap-3 mb-6 mt-4">
                            <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                            <h3 className="text-sm font-headline uppercase tracking-tight text-white/90">
                                Порядок формирования рейтинга
                            </h3>
                            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                        </div>

                        <div className="space-y-6 pb-20">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-indigo-400">
                                    <ChevronRight className="h-4 w-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Шаг 1: Первичная сортировка</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                                    <p className="text-xs text-white/90 leading-relaxed font-bold">
                                        Система суммирует все <span className="text-primary">базовые баллы</span> за занятые места во всех турах и прибавляет к ним накопленные <span className="text-primary">бонусные баллы</span>.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-indigo-400">
                                    <ChevronRight className="h-4 w-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Шаг 2: Система Тай-брейков</span>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] text-muted-foreground uppercase font-black ml-2 mb-2">При равенстве очков приоритет отдается:</p>
                                    <div className="grid gap-2">
                                        <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-white/[0.03] border border-white/5">
                                            <span className="text-[10px] font-black text-white uppercase tracking-tight">1. Средний набор (AVG)</span>
                                            <span className="text-[10px] font-headline text-primary">РЕШАЮЩИЙ</span>
                                        </div>
                                        <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-white/[0.03] border border-white/5">
                                            <span className="text-[10px] font-black text-white uppercase tracking-tight">2. Макс. чекаут (HF)</span>
                                            <span className="text-[10px] font-headline text-primary">ВТОРИЧНЫЙ</span>
                                        </div>
                                        <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-white/[0.03] border border-white/5">
                                            <span className="text-[10px] font-black text-white uppercase tracking-tight">3. Максимумы (180)</span>
                                            <span className="text-[10px] font-headline text-primary">ТРЕТИЧНЫЙ</span>
                                        </div>
                                        <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-white/[0.03] border border-white/5">
                                            <span className="text-[10px] font-black text-white uppercase tracking-tight">4. Опыт (Матчи)</span>
                                            <span className="text-[10px] font-headline text-primary">ФИНАЛЬНЫЙ</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-indigo-400">
                                    <ChevronRight className="h-4 w-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Шаг 3: Дублирование мест</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20">
                                    <p className="text-xs text-indigo-200/80 leading-relaxed italic">
                                        В спортивной системе DartBrig Pro места могут делиться. Если у двух игроков идентичны все показатели тай-брейка — они оба занимают одно место.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </ScrollArea>
            </Tabs>
        </div>

        <div className="bg-black/95 p-3 px-6 border-t border-white/5 shrink-0">
          <div className="flex justify-between items-center max-w-2xl mx-auto">
            <div className="flex flex-col">
                <p className="text-[9px] text-white font-black uppercase tracking-widest leading-none">DartBrig Pro</p>
                <p className="text-[7px] text-primary/50 font-bold uppercase tracking-[0.2em] mt-1">v2.8 Stable Audit</p>
            </div>
            <Button onClick={() => setOpen(false)} variant="outline" className="rounded-xl font-black uppercase tracking-widest text-[9px] h-9 px-6 border-white/10 bg-white/5 hover:bg-primary hover:text-primary-foreground transition-all active:scale-95">
                ПОНЯТНО
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
