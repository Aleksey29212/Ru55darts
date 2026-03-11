'use client';

import type { Player, LeagueId } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { ChevronRight, Award, Zap, Star, Calendar, ExternalLink, Target, Trophy, Medal } from 'lucide-react';
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
        general: { text: 'text-cyan-400', border: 'border-cyan-500/30', bg: 'bg-cyan-500/5', glow: 'shadow-[0_0_30px_rgba(6,182,212,0.25)]', muted: 'text-cyan-400/60', accent: 'bg-cyan-500' },
        evening_omsk: { text: 'text-orange-400', border: 'border-orange-500/30', bg: 'bg-orange-500/5', glow: 'shadow-[0_0_30px_rgba(249,115,22,0.25)]', muted: 'text-orange-400/60', accent: 'bg-orange-500' },
        premier: { text: 'text-rose-400', border: 'border-rose-500/30', bg: 'bg-rose-500/5', glow: 'shadow-[0_0_30px_rgba(244,63,94,0.25)]', muted: 'text-rose-400/60', accent: 'bg-rose-500' },
        first: { text: 'text-amber-400', border: 'border-orange-500/30', bg: 'bg-amber-500/5', glow: 'shadow-[0_0_30_rgba(245,158,11,0.25)]', muted: 'text-amber-400/60', accent: 'bg-amber-500' },
        cricket: { text: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/5', glow: 'shadow-[0_0_30px_rgba(16,185,129,0.25)]', muted: 'text-emerald-400/60', accent: 'bg-emerald-500' },
        senior: { text: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/5', glow: 'shadow-[0_0_30px_rgba(59,130,246,0.25)]', muted: 'text-blue-400/60', accent: 'bg-blue-500' },
        youth: { text: 'text-lime-400', border: 'border-lime-500/30', bg: 'bg-lime-500/5', glow: 'shadow-[0_0_30px_rgba(132,204,22,0.25)]', muted: 'text-lime-400/60', accent: 'bg-lime-500' },
        women: { text: 'text-indigo-400', border: 'border-indigo-500/30', bg: 'bg-indigo-500/5', glow: 'shadow-[0_0_30px_rgba(99,102,241,0.25)]', muted: 'text-indigo-400/60', accent: 'bg-indigo-500' },
    };
    return themes[leagueId] || themes.general;
};

const DESKTOP_GRID_COLS = "grid-cols-[80px_1.8fr_100px_100px_100px_100px_120px_100px_140px]";

function FederalHeader({ theme }: { theme: any }) {
    return (
        <div className={cn(
            "grid gap-6 px-10 opacity-60 select-none items-center font-headline text-[11px] uppercase tracking-[0.3em] font-black",
            "sticky top-[290px] md:top-[350px] z-30 bg-background/95 backdrop-blur-xl py-6 border-b border-white/10 -mx-4 px-10 rounded-t-3xl shadow-[0_15px_30px_rgba(0,0,0,0.3)]",
            DESKTOP_GRID_COLS
        )}>
            <span className="text-center">МЕСТО</span>
            <span className="text-left pl-16">ПРО-ИГРОК</span>
            <span className="text-center">ТУРЫ</span>
            <span className="text-center">БАЗА</span>
            <span className="text-center">180</span>
            <span className="text-center">МАКС</span>
            <span className="text-center">AVG</span>
            <span className="text-right">БОНУС</span>
            <span className="text-right pr-6">ВСЕГО</span>
        </div>
    );
}

function FederalCapsule({ player, leagueUrlParam, theme, intensity }: { player: Player, leagueUrlParam: string, theme: any, intensity: number }) {
    const isTop3 = player.rank >= 1 && player.rank <= 3;
    const medalColors = {
        1: 'text-gold',
        2: 'text-silver',
        3: 'text-bronze'
    };

    return (
        <Link href={`/player/${player.id}?${leagueUrlParam}`} className="block group">
            <div className={cn(
                "relative grid gap-6 border rounded-[2.5rem] p-3 pr-10 transition-all duration-300 items-center mb-4",
                DESKTOP_GRID_COLS,
                "hover:scale-[1.02] hover:bg-white/10 active:scale-[0.98] hover:border-white/30",
                theme.bg,
                theme.border,
                theme.glow,
                "group-active:ring-4 group-active:ring-white/20 group-active:shadow-[0_0_50px_rgba(255,255,255,0.4)] shadow-2xl"
            )}>
                <div className="flex justify-center items-center gap-2">
                    <span 
                        className={cn(
                            "text-4xl font-headline transition-all duration-500 group-active:text-white drop-shadow-lg", 
                            isTop3 ? medalColors[player.rank as 1|2|3] : theme.text
                        )}
                        style={{ opacity: intensity, textShadow: intensity > 0.8 ? '0 0 25px currentColor' : 'none' }}
                    >
                        {player.rank}
                    </span>
                </div>

                <div className="flex items-center gap-6 min-w-0">
                    <div className="relative shrink-0">
                        <Avatar className={cn("h-14 w-14 border-2 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-2xl", theme.border.replace('/30', '/60'))}>
                            <AvatarImage src={player.avatarUrl} alt={player.name} />
                            <AvatarFallback className="text-lg bg-muted">{player.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {player.rank === 1 && (
                            <div className="absolute -top-2 -right-2 bg-gold p-1.5 rounded-lg shadow-xl border-2 border-background animate-bounce duration-[3s]">
                                <Trophy className="h-3 w-3 text-black" />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col min-w-0 gap-1">
                        <span className="font-headline text-lg uppercase tracking-tighter truncate group-hover:text-glow-white transition-all duration-500">{player.name}</span>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-[10px] uppercase font-black tracking-widest w-fit py-0.5 px-3 opacity-70 group-hover:opacity-100 bg-white/10 text-white border-white/5">{player.nickname || 'MASTER'}</Badge>
                            {player.isQualifiedForFinal && (
                                <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                            )}
                        </div>
                    </div>
                </div>

                <div className="text-center font-headline font-bold text-lg opacity-80 group-hover:opacity-100 text-white/90">{player.matchesPlayed}</div>
                <div className="text-center font-headline font-bold text-lg opacity-80 group-hover:opacity-100 text-white/90">{player.basePoints}</div>
                <div className="text-center font-headline font-bold text-lg text-orange-400 group-hover:text-glow-accent transition-all">{player.n180s || 0}</div>
                <div className="text-center font-headline font-bold text-lg text-pink-500 group-hover:text-glow-accent transition-all">{player.hiOut || 0}</div>
                <div className="text-center font-headline font-bold text-lg text-yellow-400 group-hover:text-glow-accent transition-all">{player.avg.toFixed(1)}</div>
                <div className="text-right font-headline font-bold text-lg text-success group-hover:text-glow-white transition-all">+{player.bonusPoints}</div>

                <div className="text-right pr-6">
                    <span className={cn("text-4xl font-headline text-glow transition-all duration-700 group-hover:scale-125 inline-block", theme.text)}>
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
      <div className="space-y-6">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-[2.5rem]" />)}
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
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
                <FederalHeader theme={theme} />
                <div className="space-y-2 mt-4">
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
            <div className="animate-in fade-in duration-700 px-1">
                {/* Mobile Sticky Title */}
                <div className="sticky top-[290px] z-30 bg-background/95 backdrop-blur-xl py-4 mb-6 border-b border-white/10 rounded-t-[2rem] px-6 shadow-xl">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">СПИСОК УЧАСТНИКОВ</span>
                        <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">LIVE RANKINGS</span>
                        </div>
                    </div>
                </div>

                <Accordion type="multiple" className="w-full space-y-8">
                {players.map((player, idx) => {
                    const intensity = getIntensity(idx, players.length);
                    const isTop3 = player.rank >= 1 && player.rank <= 3;
                    const medalColors = {
                        1: 'text-gold',
                        2: 'text-silver',
                        3: 'text-bronze'
                    };

                    return (
                        <AccordionItem value={player.id} key={player.id} className={cn(
                            "border-0 rounded-[3rem] glassmorphism overflow-hidden transition-all duration-500 group relative shadow-[0_30px_80px_rgba(0,0,0,0.5)]",
                            "data-[state=open]:ring-4 data-[state=open]:ring-white/20 data-[state=open]:shadow-[0_0_60px_rgba(255,255,255,0.2)]",
                            player.isQualifiedForFinal && "ring-2 ring-orange-500/40"
                        )}>
                            <AccordionTrigger className="px-6 py-8 hover:no-underline interactive-scale relative [&>svg]:hidden">
                                <div className="flex items-center justify-start gap-4 w-full relative z-10">
                                    <div 
                                        className={cn(
                                            "font-headline text-4xl leading-none select-none pointer-events-none shrink-0 transition-all duration-700 min-w-[55px]", 
                                            isTop3 ? medalColors[player.rank as 1|2|3] : theme.text
                                        )}
                                        style={{ opacity: Math.max(0.3, intensity), filter: intensity > 0.8 ? 'drop-shadow(0 0 15px currentColor)' : 'none' }}
                                    >
                                        #{player.rank}
                                    </div>

                                    <div className="relative shrink-0">
                                        <Avatar className="h-16 w-14 rounded-[1.25rem] border-2 border-white/10 shadow-3xl transition-all duration-700 group-data-[state=open]:scale-110 group-data-[state=open]:rotate-3 group-data-[state=open]:border-white/40">
                                            <AvatarImage src={player.avatarUrl} alt={player.name} className="object-cover" />
                                            <AvatarFallback className="bg-muted text-xl">{player.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        {player.isQualifiedForFinal && (
                                            <div className="absolute -top-2 -right-2 bg-orange-500 p-2 rounded-xl shadow-2xl border-2 border-background animate-pulse">
                                                <Award className="h-3.5 w-3.5 text-white" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col items-start min-w-0 flex-1 ml-2">
                                        <span className="font-headline text-2xl leading-tight text-left text-white tracking-tighter uppercase break-words w-full drop-shadow-2xl group-data-[state=open]:text-glow-white transition-all duration-500">
                                            {player.name}
                                        </span>
                                        
                                        <div className="flex items-baseline gap-3 mt-2">
                                            <span className={cn("font-headline text-3xl leading-none transition-all duration-1000 text-glow", theme.text)}>
                                                {player.points}
                                            </span>
                                            <span className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.3em]">ОЧКОВ</span>
                                        </div>
                                    </div>

                                    <div className="shrink-0 ml-2">
                                        <div className={cn("p-2 rounded-full border border-white/5 transition-all duration-500 group-data-[state=open]:rotate-90 group-data-[state=open]:bg-white/10", theme.text)}>
                                            <ChevronRight className="h-6 w-6 opacity-60" />
                                        </div>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="bg-black/60 border-t-2 border-white/10 animate-in slide-in-from-top-4 duration-500">
                                <div className="p-8 space-y-10">
                                    <div className="grid grid-cols-3 gap-4 w-full">
                                        <div className="flex flex-col items-center justify-center bg-white/[0.04] border-2 border-white/10 rounded-[2rem] py-6 px-2 shadow-inner h-full transition-all hover:bg-white/[0.08] active:scale-95 group/stat">
                                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 mb-3 text-center">НАБОР AVG</span>
                                            <div className="flex flex-col items-center gap-2">
                                                <Zap className="h-6 w-6 drop-shadow-[0_0_12px_currentColor] text-yellow-400 group-hover/stat:animate-pulse" />
                                                <span className="font-headline font-bold text-2xl text-white tracking-tight leading-none">{(player.avg || 0).toFixed(1)}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center justify-center bg-white/[0.04] border-2 border-white/10 rounded-[2rem] py-6 px-2 shadow-inner h-full transition-all hover:bg-white/[0.08] active:scale-95 group/stat">
                                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 mb-3 text-center">ФИНИШ MAX</span>
                                            <div className="flex flex-col items-center gap-2">
                                                <Target className="h-6 w-6 drop-shadow-[0_0_12px_currentColor] text-pink-500 group-hover/stat:animate-pulse" />
                                                <span className="font-headline font-bold text-2xl text-white tracking-tight leading-none">{player.hiOut}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center justify-center bg-white/[0.04] border-2 border-white/10 rounded-[2rem] py-6 px-2 shadow-inner h-full transition-all hover:bg-white/[0.08] active:scale-95 group/stat">
                                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 mb-3 text-center">180-КИ</span>
                                            <div className="flex flex-col items-center gap-2">
                                                <Star className="h-6 w-6 drop-shadow-[0_0_12px_currentColor] text-orange-500 group-hover/stat:animate-pulse" />
                                                <span className="font-headline font-bold text-2xl text-white tracking-tight leading-none">{player.n180s}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="flex flex-col items-center justify-center bg-white/5 border-2 border-white/5 rounded-[3rem] p-8 shadow-3xl relative overflow-hidden group/detail">
                                            <Calendar className="h-8 w-8 opacity-30 mb-4 text-muted-foreground group-hover/detail:scale-110 transition-transform" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/50 mb-2">УЧАСТИЕ</span>
                                            <div className="flex items-baseline gap-2">
                                                <span className="font-headline text-4xl md:text-5xl tracking-tighter text-white/80">{player.matchesPlayed}</span>
                                                <span className="text-xs font-black uppercase text-white/30">ТУРОВ</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center justify-center bg-white/5 border-2 border-white/5 rounded-[3rem] p-8 shadow-3xl relative overflow-hidden group/detail">
                                            <Award className="h-8 w-8 opacity-30 mb-4 text-success group-hover/detail:scale-110 transition-transform" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/50 mb-2">БОНУСЫ</span>
                                            <div className="flex items-baseline gap-2">
                                                <span className="font-headline text-4xl md:text-5xl tracking-tighter text-success text-glow-white">+{player.bonusPoints}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {leagueId === 'evening_omsk' && (
                                        <div className="p-8 rounded-[3rem] bg-orange-500/15 border-2 border-orange-500/30 flex items-center justify-between shadow-3xl group/omsk">
                                            <div className="flex items-center gap-6">
                                                <div className="p-4 rounded-[1.5rem] bg-orange-500/20 shadow-2xl transition-transform group-hover/omsk:rotate-12"><Trophy className="h-8 w-8 text-orange-400" /></div>
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-black text-orange-300/50 uppercase tracking-[0.3em]">БАЛАНС</span>
                                                    <span className="font-headline text-3xl text-orange-400 text-glow-accent">{(player.cashValue || 0).toLocaleString('ru-RU')} ₽</span>
                                                </div>
                                            </div>
                                            <ChevronRight className="h-8 w-8 text-orange-500/30" />
                                        </div>
                                    )}
                                    
                                    <Button asChild className={cn(
                                        "w-full h-20 rounded-[2.5rem] font-headline text-2xl shadow-[0_20px_60px_rgba(0,0,0,0.4)] interactive-scale text-white group transition-all duration-500 border-2 border-white/10",
                                        theme.accent
                                    )} size="lg">
                                        <Link href={`/player/${player.id}?${leagueUrlParam}`}>
                                            <div className="flex items-center justify-center gap-6">
                                                <span className="uppercase tracking-tighter">ПРОФИЛЬ ИГРОКА</span>
                                                <ExternalLink className="h-8 w-8 transition-all duration-500 group-hover:translate-x-2 group-hover:-translate-y-2 group-hover:scale-110" />
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
