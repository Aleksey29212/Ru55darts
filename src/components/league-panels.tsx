'use client';

import { useRouter } from 'next/navigation';
import type { LeagueId, Player, AllLeagueSettings, ScoringSettings, SponsorshipSettings, Partner } from '@/lib/types';
import { LeaderboardHero } from '@/components/leaderboard-hero';
import { PlayerRankings } from '@/components/player-rankings';
import { cn } from '@/lib/utils';
import { Target, Sunset, Sparkles, Wallet, Award, ShieldCheck, Trophy, CircleUser, Loader2 } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import Image from 'next/image';
import { Button } from './ui/button';
import { useIsClient } from '@/hooks/use-is-client';
import { ScoringHelpDialog } from './scoring-help-dialog';
import { useTransition, useEffect, useState } from 'react';
import { PartnersDisplay } from './partners-display';

interface LeaguePanelsProps {
  enabledLeagues: LeagueId[];
  leagueSettings: AllLeagueSettings;
  currentLeagueRankings: Player[];
  currentLeagueId: LeagueId;
  allScoringSettings: Record<LeagueId, ScoringSettings>;
  sponsorshipSettings: SponsorshipSettings;
  partners: Partner[];
}

const DEFAULT_BANNER = 'https://picsum.photos/seed/darts-league/600/200';

const leagueIcons: Record<string, any> = {
    general: Trophy,
    evening_omsk: Sunset,
    premier: Target,
    cricket: Target,
    first: Award,
    women: CircleUser,
};

const getLeagueBaseColor = (leagueId: LeagueId) => {
    const colors: Record<string, string> = {
        general: 'rgba(6, 182, 212, 0.5)',
        evening_omsk: 'rgba(249, 115, 22, 0.5)',
        premier: 'rgba(244, 63, 94, 0.5)',
        first: 'rgba(245, 158, 11, 0.5)',
        cricket: 'rgba(16, 185, 129, 0.5)',
        senior: 'rgba(59, 130, 246, 0.5)',
        youth: 'rgba(132, 204, 22, 0.5)',
        women: 'rgba(99, 102, 241, 0.5)',
    };
    return colors[leagueId] || colors.general;
}

function LeagueSection({ 
    leagueId, 
    players, 
    scoringSettings, 
    sponsorshipSettings 
}: { 
    leagueId: LeagueId, 
    players: Player[], 
    scoringSettings: ScoringSettings, 
    sponsorshipSettings: SponsorshipSettings 
}) {
    const activePlayers = players.filter(p => p.matchesPlayed > 0);
    const topPlayers = activePlayers.filter(p => p.rank > 0 && p.rank <= 3).sort((a, b) => a.rank - b.rank);
    const isEveningOmsk = leagueId === 'evening_omsk';

    return (
        <div className="space-y-10 md:space-y-16 py-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {isEveningOmsk && (
                <div className="relative group overflow-hidden rounded-[3rem] p-8 md:p-16 bg-gradient-to-br from-orange-600/20 via-black/40 to-transparent border-2 border-orange-500/30 shadow-[0_30px_100px_rgba(249,115,22,0.15)] transition-all hover:border-orange-500/50">
                    <div className="absolute -top-20 -right-20 p-4 opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-[3000ms]">
                        <Sunset className="h-64 w-64 md:h-[400px] md:w-[400px] text-orange-500" />
                    </div>
                    <div className="flex flex-col lg:flex-row gap-12 relative z-10 items-center lg:items-start">
                        <div className="bg-orange-500/20 p-8 rounded-[2.5rem] border-2 border-orange-500/30 h-fit animate-pulse shadow-2xl shadow-orange-500/20 group-hover:rotate-3 transition-transform">
                            <Sparkles className="h-12 w-12 md:h-16 md:w-16 text-orange-500" />
                        </div>
                        <div className="space-y-8 flex-1 text-center lg:text-left">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-center lg:justify-start gap-6">
                                <h3 className="text-4xl md:text-6xl font-headline uppercase tracking-tighter text-orange-400 drop-shadow-2xl">ВЕЧЕРНИЙ ОМСК</h3>
                                <ScoringHelpDialog settings={scoringSettings} leagueName="Вечерний Омск" sponsorshipSettings={sponsorshipSettings}>
                                    <Button variant="outline" className="rounded-full h-14 px-8 border-orange-500/30 text-orange-400 hover:bg-orange-500/20 font-bold uppercase tracking-widest text-xs gap-3 shadow-xl interactive-scale">
                                        <ShieldCheck className="h-5 w-5" />
                                        Регламент Лиги
                                    </Button>
                                </ScoringHelpDialog>
                            </div>
                            <div className="flex flex-wrap justify-center lg:justify-start gap-6 pt-6">
                                <div className="flex items-center gap-4 px-8 py-5 rounded-full bg-black/60 border-2 border-orange-500/20 shadow-2xl hover:bg-black/80 transition-all">
                                    <Wallet className="h-8 w-8 text-orange-500" />
                                    <div className="flex flex-col text-left">
                                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-orange-300/60">Курс баллов</span>
                                        <span className="text-xl md:text-2xl font-headline text-orange-300">{scoringSettings?.exchangeRate || 7} ₽ <span className="text-xs opacity-50">/ БАЛЛ</span></span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 px-8 py-5 rounded-full bg-orange-500/20 border-2 border-orange-500/40 shadow-2xl hover:scale-105 transition-all">
                                    <Award className="h-8 w-8 text-orange-400" />
                                    <div className="flex flex-col text-left">
                                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-orange-100/60">Цель сезона</span>
                                        <span className="text-xl md:text-2xl font-headline text-orange-100">ТОП-16 ФИНАЛИСТОВ</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {activePlayers.length > 0 ? (
                <>
                    {topPlayers.length > 0 && <LeaderboardHero players={topPlayers} />}
                    <PlayerRankings players={activePlayers} leagueId={leagueId} />
                </>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 md:py-48 glassmorphism rounded-[4rem] border-2 border-dashed border-primary/20 text-center px-10 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent animate-pulse" />
                    <div className="relative z-10 space-y-8">
                        <div className="p-12 rounded-[2.5rem] bg-primary/10 mb-8 ring-[12px] ring-primary/5 inline-block group-hover:scale-110 group-hover:rotate-12 transition-all shadow-xl">
                            <Target className="h-24 w-24 md:h-32 md:w-32 text-primary/30" />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-3xl md:text-5xl font-headline text-muted-foreground/40 uppercase tracking-tighter leading-none">АРЕНА ГОТОВИТСЯ</h3>
                            <p className="text-lg md:text-xl text-muted-foreground mt-4 max-w-xl mx-auto opacity-60 font-medium italic">Результаты текущего сезона еще не загружены.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export function LeaguePanels({ 
    enabledLeagues, 
    leagueSettings, 
    currentLeagueRankings, 
    currentLeagueId, 
    allScoringSettings, 
    sponsorshipSettings,
    partners 
}: LeaguePanelsProps) {
    const router = useRouter();
    const isClient = useIsClient();
    const [isPending, startTransition] = useTransition();
    const [optimisticLeagueId, setOptimisticLeagueId] = useState<LeagueId>(currentLeagueId);
    
    useEffect(() => {
        enabledLeagues.forEach(id => {
            router.prefetch(`/?league=${id}`);
        });
    }, [enabledLeagues, router]);

    useEffect(() => {
        setOptimisticLeagueId(currentLeagueId);
    }, [currentLeagueId]);

    const handleLeagueSelect = (leagueId: LeagueId) => {
        if (leagueId === optimisticLeagueId) return;
        
        setOptimisticLeagueId(leagueId);
        startTransition(() => {
            router.push(`/?league=${leagueId}`, { scroll: false });
        });
    };

    if (!isClient) {
        return (
            <div className="space-y-8">
                <div className="h-14 w-full bg-muted/20 rounded-full animate-pulse" />
                <Skeleton className="h-[600px] w-full rounded-[3rem]" />
            </div>
        );
    }

    const currentScoring = allScoringSettings[currentLeagueId];

    return (
        <div className="w-full space-y-10">
            {/* Sticky Header Section combining Partners and Leagues */}
            <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-xl border-b border-white/10 -mx-4 px-4 py-4 space-y-6 shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-all">
                {/* Fixed Partners Ticker inside sticky area */}
                <div className="w-full">
                    <PartnersDisplay partners={partners} variant="compact" hideLabel />
                </div>

                {/* League Selection Scroll */}
                <div className="flex items-center gap-2 md:gap-3 overflow-x-auto pb-1 scrollbar-hide no-scrollbar mask-fade-edges">
                    {enabledLeagues.map(leagueId => {
                        const leagueInfo = leagueSettings[leagueId];
                        const isSelected = optimisticLeagueId === leagueId;
                        const isReallySelected = currentLeagueId === leagueId;
                        const banner = leagueInfo.bannerUrl || DEFAULT_BANNER;
                        const LeagueIcon = leagueIcons[leagueId] || Target;
                        const baseColor = getLeagueBaseColor(leagueId);

                        return (
                            <div
                                key={leagueId}
                                role="button"
                                tabIndex={0}
                                onClick={() => handleLeagueSelect(leagueId)}
                                className={cn(
                                    'relative min-w-[130px] md:min-w-[160px] h-10 md:h-12 rounded-full overflow-hidden transition-all duration-300 transform shrink-0 cursor-pointer outline-none interactive-scale border shadow-md',
                                    isSelected 
                                        ? 'border-primary ring-1 ring-primary/20 scale-105 z-10 shadow-primary/10' 
                                        : 'border-white/5 opacity-60 hover:opacity-100 hover:border-primary/30'
                                )}
                            >
                                <Image src={banner} alt="" fill className="object-cover transition-transform duration-700 group-hover:scale-110" unoptimized={banner.startsWith('data:')} />
                                <div className={cn(
                                    "absolute inset-0 bg-gradient-to-r transition-opacity duration-500",
                                    isSelected ? "from-black/90 via-black/60 to-transparent" : "from-black/80 via-black/40 to-transparent"
                                )} />
                                <div className="absolute inset-0 px-3 flex items-center gap-2">
                                    <div 
                                        className={cn(
                                            "p-1 rounded-full backdrop-blur-md border border-white/10 text-white shadow-lg transition-transform duration-500",
                                            isSelected && "scale-110"
                                        )}
                                        style={{ backgroundColor: baseColor }}
                                    >
                                        {isPending && isSelected && !isReallySelected ? (
                                            <Loader2 className="h-2.5 w-2.5 animate-spin" />
                                        ) : (
                                            <LeagueIcon className="h-2.5 w-2.5 md:h-3 md:w-3" />
                                        )}
                                    </div>
                                    <div className="flex flex-col justify-center overflow-hidden">
                                        <p className="text-[10px] md:text-[11px] font-headline text-white uppercase tracking-tight truncate leading-none mb-0.5">{leagueInfo.name}</p>
                                        <div className="flex items-center gap-1">
                                            <div 
                                                className={cn("h-0.5 w-0.5 rounded-full", isSelected ? "animate-pulse" : "opacity-30")} 
                                                style={{ backgroundColor: baseColor }}
                                            />
                                            <p className="text-[6px] md:text-[7px] text-white/50 font-bold uppercase tracking-widest">
                                                {isSelected ? 'LIVE' : 'ВЫБРАТЬ'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
            
            <div className="w-full relative pt-4">
                {isPending && (
                    <div className="absolute inset-0 z-10 bg-background/20 backdrop-blur-[2px] transition-all duration-300 pointer-events-none" />
                )}
                <section key={currentLeagueId} className="animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/20" />
                        <h2 className="text-2xl md:text-4xl font-headline uppercase tracking-tighter text-primary/80">
                            {leagueSettings[currentLeagueId]?.name}
                        </h2>
                        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/20" />
                    </div>
                    
                    <LeagueSection 
                        leagueId={currentLeagueId}
                        players={currentLeagueRankings}
                        scoringSettings={currentScoring}
                        sponsorshipSettings={sponsorshipSettings}
                    />
                </section>
            </div>
        </div>
    );
}