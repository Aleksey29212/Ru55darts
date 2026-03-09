'use client';

import type { Player, LeagueId } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { ChevronRight, Award, Zap, Star, Calendar, ExternalLink, Target, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from '@/lib/utils';
import { useIsClient } from '@/hooks/use-is-client';
import { Skeleton } from './ui/skeleton';
import { Button } from './ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface PlayerRankingsProps {
  players: Player[];
  leagueId?: LeagueId;
}

const getLeagueTheme = (leagueId: LeagueId = 'general') => {
    const themes: Record<string, { 
        text: string, 
        border: string, 
        bg: string, 
        glow: string,
        muted: string,
        accent: string
    }> = {
        general: { text: 'text-cyan-400', border: 'border-cyan-500/20', bg: 'bg-cyan-500/5', glow: 'shadow-[0_0_20px_rgba(6,182,212,0.2)]', muted: 'text-cyan-400/60', accent: 'bg-cyan-500' },
        evening_omsk: { text: 'text-orange-400', border: 'border-orange-500/20', bg: 'bg-orange-500/5', glow: 'shadow-[0_0_20px_rgba(249,115,22,0.2)]', muted: 'text-orange-400/60', accent: 'bg-orange-500' },
        premier: { text: 'text-rose-400', border: 'border-rose-500/20', bg: 'bg-rose-500/5', glow: 'shadow-[0_0_20px_rgba(244,63,94,0.2)]', muted: 'text-rose-400/60', accent: 'bg-rose-500' },
        first: { text: 'text-amber-400', border: 'border-orange-500/20', bg: 'bg-amber-500/5', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.2)]', muted: 'text-amber-400/60', accent: 'bg-amber-500' },
        cricket: { text: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]', muted: 'text-emerald-400/60', accent: 'bg-emerald-500' },
        senior: { text: 'text-blue-400', border: 'border-blue-500/20', bg: 'bg-blue-500/5', glow: 'shadow-[0_0_20px_rgba(59,130,246,0.2)]', muted: 'text-blue-400/60', accent: 'bg-blue-500' },
        youth: { text: 'text-lime-400', border: 'border-lime-500/20', bg: 'bg-lime-500/5', glow: 'shadow-[0_0_20px_rgba(132,204,22,0.2)]', muted: 'text-lime-400/60', accent: 'bg-lime-500' },
        women: { text: 'text-indigo-400', border: 'border-indigo-500/20', bg: 'bg-indigo-500/5', glow: 'shadow-[0_0_20px_rgba(99,102,241,0.2)]', muted: 'text-indigo-400/60', accent: 'bg-indigo-500' },
    };
    return themes[leagueId] || themes.general;
};

// Строгая конфигурация колонок CSS Grid для идеального выравнивания
const DESKTOP_GRID_COLS = "grid-cols-[60px_1.5fr_80px_80px_80px_80px_100px_80px_120px]";

function FederalHeader({ theme }: { theme: any }) {
    return (
        <div className={cn("grid gap-4 px-8 mb-4 opacity-50 select-none items-center font-headline text-[10px] uppercase tracking-widest", DESKTOP_GRID_COLS)}>
            <span className="text-center">Место</span>
            <span className="text-left pl-14">Игрок</span>
            <span className="text-center">Туры</span>
            <span className="text-center">Осн.</span>
            <span className="text-center">180</span>
            <span className="text-center">Max</span>
            <span className="text-center">Avg</span>
            <span className="text-right">Доп.</span>
            <span className="text-right pr-4">Всего</span>
        </div>
    );
}

function FederalCapsule({ player, leagueUrlParam, theme, intensity }: { player: Player, leagueUrlParam: string, theme: any, intensity: number }) {
    return (
        <Link href={`/player/${player.id}?${leagueUrlParam}`} className="block group">
            <div className={cn(
                "relative grid gap-4 border rounded-full p-2.5 pr-8 transition-all duration-150 items-center mb-3",
                DESKTOP_GRID_COLS,
                "hover:scale-[1.01] hover:bg-white/10 active:scale-[0.98] hover:border-white/20",
                theme.bg,
                theme.border,
                theme.glow,
                "group-active:ring-2 group-active:ring-white group-active:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
            )}>
                <div className="flex justify-center">
                    <span 
                        className={cn("text-3xl font-headline transition-all group-active:text-white", theme.text)}
                        style={{ opacity: intensity, textShadow: intensity > 0.8 ? '0 0 15px currentColor' : 'none' }}
                    >
                        {player.rank}
                    </span>
                </div>

                <div className="flex items-center gap-4 min-w-0">
                    <Avatar className={cn("h-12 w-12 border-2 transition-transform group-hover:scale-105 shrink-0", theme.border.replace('/20', '/40'))}>
                        <AvatarImage src={player.avatarUrl} alt={player.name} />
                        <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                        <span className="font-bold text-base truncate group-hover:text-white transition-colors">{player.name}</span>
                        <Badge variant="secondary" className="text-[9px] uppercase font-bold tracking-widest w-fit py-0 px-2 opacity-60 group-hover:opacity-100">{player.nickname || 'новичок'}</Badge>
                    </div>
                </div>

                <div className="text-center font-mono font-bold text-sm opacity-70 group-hover:opacity-100">{player.matchesPlayed}</div>
                <div className="text-center font-mono font-bold text-sm opacity-70 group-hover:opacity-100">{player.basePoints}</div>
                <div className="text-center font-mono font-bold text-sm text-orange-400 group-hover:brightness-125">{player.n180s || 0}</div>
                <div className="text-center font-mono font-bold text-sm text-pink-400 group-hover:brightness-125">{player.hiOut || 0}</div>
                <div className="text-center font-mono font-bold text-sm text-yellow-400 group-hover:brightness-125">{player.avg.toFixed(1)}</div>
                <div className="text-right font-mono font-bold text-sm text-success group-hover:brightness-125">+{player.bonusPoints}</div>

                <div className="text-right pr-4">
                    <span className={cn("text-3xl font-headline text-glow transition-all group-hover:scale-110 inline-block", theme.text)}>
                        {player.points}
                    </span>
                </div>
            </div>
        </Link>
    );
}

export function PlayerRankings({ players, leagueId }: PlayerRankingsProps) {
  const isClient = useIsClient();
  const isMobile = useIsMobile();
  const theme = getLeagueTheme(leagueId);
  const leagueUrlParam = leagueId ? `leagueId=${leagueId}` : '';

  if (!isClient) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-[2rem]" />)}
      </div>
    );
  }

  const getIntensity = (index: number, total: number) => {
      if (total <= 1) return 1.0;
      return Math.max(0.4, 1.0 - (index / total) * 0.6);
  };

  return (
    <div className="w-full">
        {!isMobile ? (
            <div className="animate-in fade-in duration-500">
                <FederalHeader theme={theme} />
                <div className="space-y-1">
                    {players.map((player, idx) => (
                        <FederalCapsule 
                            key={player.id} 
                            player={player} 
                            leagueUrlParam={leagueUrlParam} 
                            theme={theme} 
                            intensity={getIntensity(idx, players.length)}
                        />
                    ))}
                </div>
            </div>
        ) : (
            <div className="animate-in fade-in duration-500 px-1">
                <Accordion type="multiple" className="w-full space-y-6">
                {players.map((player, idx) => {
                    const intensity = getIntensity(idx, players.length);
                    return (
                        <AccordionItem value={player.id} key={player.id} className={cn(
                            "border-0 rounded-[2.5rem] glassmorphism overflow-hidden transition-all duration-300 group relative shadow-2xl",
                            "data-[state=open]:ring-2 data-[state=open]:ring-white data-[state=open]:shadow-[0_0_40px_rgba(255,255,255,0.2)]",
                            player.isQualifiedForFinal && "ring-2 ring-orange-500/30"
                        )}>
                            <AccordionTrigger className="px-4 py-6 hover:no-underline interactive-scale relative [&>svg]:hidden">
                                <div className="flex items-center justify-start gap-2 w-full relative z-10">
                                    <div 
                                        className={cn("font-headline text-3xl leading-none select-none pointer-events-none shrink-0 transition-all min-w-[45px]", theme.text)}
                                        style={{ opacity: Math.max(0.3, intensity), filter: intensity > 0.8 ? 'drop-shadow(0 0 10px currentColor)' : 'none' }}
                                    >
                                        #{player.rank}
                                    </div>

                                    <div className="relative shrink-0">
                                        <Avatar className="h-14 w-14 rounded-2xl border-2 border-white/10 shadow-2xl transition-all group-data-[state=open]:scale-110 group-data-[state=open]:border-white">
                                            <AvatarImage src={player.avatarUrl} alt={player.name} />
                                            <AvatarFallback className="bg-muted text-lg">{player.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        {player.isQualifiedForFinal && (
                                            <div className="absolute -top-2 -right-2 bg-orange-500 p-1.5 rounded-lg shadow-lg border-2 border-background">
                                                <Award className="h-3 w-3 text-white" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col items-start min-w-0 flex-1 ml-2">
                                        <span className="font-headline text-xl leading-tight text-left text-white tracking-tighter uppercase break-words w-full drop-shadow-md group-data-[state=open]:text-glow-white">
                                            {player.name}
                                        </span>
                                        
                                        <div className="flex items-baseline gap-2 mt-1">
                                            <span className={cn("font-headline text-2xl leading-none transition-all duration-500 text-glow", theme.text)}>
                                                {player.points}
                                            </span>
                                            <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">Баллов</span>
                                        </div>
                                    </div>

                                    <div className="shrink-0 ml-1">
                                        <ChevronRight className={cn("h-6 w-6 opacity-40 group-data-[state=open]:rotate-90 transition-transform", theme.text)} />
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="bg-black/40 border-t border-white/5 animate-in slide-in-from-top-2 duration-300">
                                <div className="p-6 space-y-8">
                                    <div className="grid grid-cols-3 gap-3 w-full">
                                        <div className="flex flex-col items-center justify-center bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-1 shadow-inner h-full transition-colors hover:bg-white/[0.06]">
                                            <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 mb-1.5">AVG</span>
                                            <div className="flex flex-col items-center gap-1">
                                                <Zap className="h-4 w-4 drop-shadow-[0_0_8px_currentColor] text-yellow-400" />
                                                <span className="font-headline font-bold text-base text-white tracking-tight leading-none">{(player.avg || 0).toFixed(1)}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center justify-center bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-1 shadow-inner h-full transition-colors hover:bg-white/[0.06]">
                                            <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 mb-1.5">MAX</span>
                                            <div className="flex flex-col items-center gap-1">
                                                <Target className="h-4 w-4 drop-shadow-[0_0_8px_currentColor] text-pink-500" />
                                                <span className="font-headline font-bold text-base text-white tracking-tight leading-none">{player.hiOut}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center justify-center bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-1 shadow-inner h-full transition-colors hover:bg-white/[0.06]">
                                            <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 mb-1.5">180</span>
                                            <div className="flex flex-col items-center gap-1">
                                                <Star className="h-4 w-4 drop-shadow-[0_0_8px_currentColor] text-orange-500" />
                                                <span className="font-headline font-bold text-base text-white tracking-tight leading-none">{player.n180s}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col items-center justify-center bg-white/5 border border-white/5 rounded-[2.5rem] p-6 flex-1 shadow-2xl relative overflow-hidden group">
                                            <Calendar className="h-6 w-6 opacity-40 mb-3 text-muted-foreground" />
                                            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60 mb-1">Участие</span>
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="font-headline text-3xl md:text-4xl tracking-tighter text-muted-foreground">{player.matchesPlayed}</span>
                                                <span className="text-[10px] font-bold uppercase text-muted-foreground/40">ТУРОВ</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center justify-center bg-white/5 border border-white/5 rounded-[2.5rem] p-6 flex-1 shadow-2xl relative overflow-hidden group">
                                            <Award className="h-6 w-6 opacity-40 mb-3 text-success" />
                                            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60 mb-1">Бонусы</span>
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="font-headline text-3xl md:text-4xl tracking-tighter text-success">+{player.bonusPoints}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {leagueId === 'evening_omsk' && (
                                        <div className="p-6 rounded-[2.5rem] bg-orange-500/10 border-2 border-orange-500/20 flex items-center justify-between shadow-2xl">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 rounded-2xl bg-orange-500/20"><Trophy className="h-6 w-6 text-orange-500" /></div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-orange-300/60 uppercase tracking-widest">Текущий баланс</span>
                                                    <span className="font-headline text-2xl text-orange-400">{(player.cashValue || 0).toLocaleString('ru-RU')} ₽</span>
                                                </div>
                                            </div>
                                            <ChevronRight className="h-6 w-6 text-orange-500/40" />
                                        </div>
                                    )}
                                    
                                    <Button asChild className={cn(
                                        "w-full h-16 rounded-[2rem] font-bold shadow-2xl interactive-scale text-xl text-white group",
                                        theme.accent
                                    )} size="lg">
                                        <Link href={`/player/${player.id}?${leagueUrlParam}`}>
                                            <div className="flex items-center justify-center gap-4">
                                                <span className="uppercase tracking-tighter">Личная карточка</span>
                                                <ExternalLink className="h-6 w-6 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                                            </div>
                                        </Link>
                                    </Button>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    );
                })}
                </Accordion>
            </div>
        )}
    </div>
  );
}
