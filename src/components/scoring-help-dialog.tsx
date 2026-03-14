
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
    Activity
} from 'lucide-react';
import type { ScoringSettings, SponsorshipSettings } from '@/lib/types';
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

  const renderLeagueContent = (s: ScoringSettings, name: string) => {
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
                        <h4 className="font-headline text-xs md:text-sm uppercase tracking-tight text-orange-400">Множители этапов ({name})</h4>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 relative z-10">
                        {renderHelpPill('1-е', `× 1.00`, Medal, 'text-gold', 'Победа')}
                        {renderHelpPill('2-е', `× 0.70`, Medal, 'text-silver', 'Финал')}
                        {renderHelpPill('1/2', `× 0.50`, Medal, 'text-bronze', 'Полуфинал')}
                        {renderHelpPill('1/4', `× 0.25`, Target, 'text-primary', 'Четвертьфинал')}
                    </div>
                    <div className="p-3 bg-black/40 rounded-xl border border-white/5 mt-2 relative z-10">
                        <p className="text-[10px] md:text-[11px] text-white/80 leading-relaxed italic text-center">
                            <span className="text-primary font-bold">Формула:</span> AVG × Множитель. Победитель тура получает множитель 1.0.
                        </p>
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
        while (end + 1 <= 16 && getPointsForRank(end + 1, s) === pts) { end++; }
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

    return (
        <div className="flex flex-col gap-4 pt-1 pb-16">
            {s.participationPoints > 0 && (
                <div className="py-2.5 px-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-2">
                        <div className="p-1 rounded-md bg-black/40"><Sparkles className="h-4 w-4 text-primary" /></div>
                        <span className="text-[10px] font-black uppercase tracking-tight">Участие ({name})</span>
                    </div>
                    <span className="font-headline text-lg md:text-xl text-primary">+{s.participationPoints}</span>
                </div>
            )}

            <div className="space-y-2">
                <div className="flex items-center gap-2 px-2 border-l-2 border-orange-500">
                    <Trophy className="h-4 w-4 text-orange-500" />
                    <h4 className="font-headline text-[9px] uppercase tracking-widest text-white/60">Базовые баллы ({name})</h4>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-1.5">
                    {groupedRanks.map((p, idx) => (
                        <div key={idx}>{renderHelpPill(p.label, p.points, p.icon, p.color, p.desc)}</div>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center gap-2 px-2 border-l-2 border-cyan-400">
                    <Star className="h-4 w-4 text-cyan-400" />
                    <h4 className="font-headline text-[9px] uppercase tracking-widest text-white/60">Бонусы ({name})</h4>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-1.5">
                    {s.enable180Bonus && renderHelpPill('180', `+${s.bonusPer180}`, Sparkles, 'text-orange-400')}
                    {s.enableHiOutBonus && renderHelpPill(`OUT ≥${s.hiOutThreshold}`, `+${s.hiOutBonus}`, Zap, 'text-yellow-400')}
                    {s.enableAvgBonus && renderHelpPill(`AVG ≥${s.avgThreshold}`, `+${s.avgBonus}`, Activity, 'text-yellow-400')}
                </div>
            </div>
        </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="glassmorphism max-w-2xl p-0 overflow-hidden border-white/10 rounded-[2rem] bg-[#050505] w-[96vw] h-[85dvh] flex flex-col">
        <DialogHeader className="bg-gradient-to-b from-white/5 to-transparent pt-4 pb-3 px-6 relative items-center text-center shrink-0 border-b border-white/10">
            <Button onClick={() => setOpen(false)} asChild variant="ghost" size="icon" className="absolute left-4 top-1/2 -translate-y-1/2 h-9 w-9 rounded-xl hover:bg-white/5 z-20">
                <Link href="/"><Home className="h-4 w-4 text-primary" /></Link>
            </Button>
            <DialogTitle className="flex flex-col items-center">
                <span className="text-lg uppercase font-headline tracking-tighter text-white leading-none">Регламент</span>
                <span className="text-[8px] font-black uppercase tracking-[0.4em] text-primary/60 mt-1">Правила начисления баллов</span>
            </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden relative">
            <Tabs defaultValue={settingsArray[0]?.id || "general"} className="w-full flex flex-col h-full">
                <div className="px-4 mt-4 mb-2">
                    <TabsList className="bg-black/60 p-1.5 border border-white/5 h-auto flex flex-wrap justify-center gap-1.5 rounded-xl max-w-full overflow-x-auto no-scrollbar">
                        {settingsArray.map((s, idx) => {
                            const id = (s as any).id || 'general';
                            const Icon = leagueIcons[id] || Trophy;
                            const style = leagueBookStyles[id] || leagueBookStyles.general;
                            return (
                                <TabsTrigger key={id} value={id} className={cn("relative flex flex-col items-center justify-center w-16 h-12 rounded-lg border transition-all duration-300 bg-gradient-to-br", style, "data-[state=active]:border-white/40 data-[state=active]:scale-105")}>
                                    <Icon className="h-4 w-4 mb-0.5 text-white" />
                                    <span className="text-[6px] font-black uppercase tracking-tight text-white text-center leading-none truncate px-0.5 w-full">
                                        {namesArray[idx]}
                                    </span>
                                </TabsTrigger>
                            )
                        })}
                        <TabsTrigger value="ranking-logic" className="flex flex-col items-center justify-center w-16 h-12 rounded-lg border transition-all bg-gradient-to-br from-indigo-600 to-purple-900 border-indigo-400/50 data-[state=active]:scale-105">
                            <ListOrdered className="h-4 w-4 mb-0.5 text-white" />
                            <span className="text-[6px] font-black uppercase tracking-tight text-white">ЛОГИКА</span>
                        </TabsTrigger>
                    </TabsList>
                </div>

                <ScrollArea className="flex-1 px-6">
                    {settingsArray.map((s, idx) => (
                        <TabsContent key={(s as any).id || idx} value={(s as any).id || 'general'} className="outline-none animate-in fade-in duration-500 mt-4">
                            {renderLeagueContent(s, namesArray[idx])}
                        </TabsContent>
                    ))}
                    <TabsContent value="ranking-logic" className="mt-4 outline-none">
                        <div className="space-y-6 pb-20">
                            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                                <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-2">Тай-брейки (Равенство очков)</h4>
                                <p className="text-[10px] text-white/80 leading-relaxed italic">
                                    При совпадении очков приоритет: 1. Средний набор (AVG), 2. Макс. чекаут (HF), 3. Максимумы (180), 4. Опыт (Кол-во туров).
                                </p>
                            </div>
                        </div>
                    </TabsContent>
                </ScrollArea>
            </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
