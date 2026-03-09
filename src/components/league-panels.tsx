'use client';

import { useState, useEffect } from 'react';
import type { LeagueId, Player, AllLeagueSettings, ScoringSettings, SponsorshipSettings } from '@/lib/types';
import { LeaderboardHero } from '@/components/leaderboard-hero';
import { PlayerRankings } from '@/components/player-rankings';
import { cn } from '@/lib/utils';
import { Target, Sunset, Sparkles, Wallet, Award, ShieldCheck, Trophy, CircleUser } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from './ui/skeleton';
import Image from 'next/image';
import { Button } from './ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useIsClient } from '@/hooks/use-is-client';
import { ScoringHelpDialog } from './scoring-help-dialog';

interface LeaguePanelsProps {
  enabledLeagues: LeagueId[];
  leagueSettings: AllLeagueSettings;
  rankings: Player[][];
  defaultTab: LeagueId;
  allScoringSettings: Record<LeagueId, ScoringSettings>;
  sponsorshipSettings: SponsorshipSettings;
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
    leagueInfo, 
    players, 
    scoringSettings, 
    sponsorshipSettings 
}: { 
    leagueId: LeagueId, 
    leagueInfo: any, 
    players: Player[], 
    scoringSettings: ScoringSettings, 
    sponsorshipSettings: SponsorshipSettings 
}) {
    const activePlayers = players.filter(p => p.matchesPlayed > 0);
    const topPlayers = activePlayers.filter(p => p.rank > 0 && p.rank <= 3).sort((a, b) => a.rank - b.rank);
    const isEveningOmsk = leagueId === 'evening_omsk';

    return (
        <div className="space-y-10 md:space-y-16 py-8">
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

export function LeaguePanels({ enabledLeagues, leagueSettings, rankings, allScoringSettings, sponsorshipSettings }: LeaguePanelsProps) {
    const isMobile = useIsMobile();
    const isClient = useIsClient();
    
    const scrollToLeague = (leagueId: LeagueId) => {
        const element = document.getElementById(`league-${leagueId}`);
        if (element) {
            const offset = 80;
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="w-full space-y-10 relative">
            <div className="sticky top-16 z-40 bg-background/80 backdrop-blur-xl pt-4 pb-2 -mx-4 px-4 border-b border-white/5">
                <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide no-scrollbar mask-fade-edges">
                    {enabledLeagues.map(leagueId => {
                        const leagueInfo = leagueSettings[leagueId];
                        const banner = leagueInfo.bannerUrl || DEFAULT_BANNER;
                        const LeagueIcon = leagueIcons[leagueId] || Target;
                        const leagueRankings = rankings[enabledLeagues.indexOf(leagueId)] || [];
                        const playerCount = leagueRankings.filter(p => p.matchesPlayed > 0).length;
                        const baseColor = getLeagueBaseColor(leagueId);

                        return (
                            <div
                                key={leagueId}
                                role="button"
                                tabIndex={0}
                                onClick={() => scrollToLeague(leagueId)}
                                className={cn(
                                    'relative min-w-[180px] md:min-w-[220px] h-16 md:h-20 rounded-full overflow-hidden transition-all duration-500 transform shrink-0 cursor-pointer outline-none interactive-scale border-2 border-white/5 hover:border-primary/30 group shadow-lg'
                                )}
                            >
                                <Image src={banner} alt="" fill className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-60" unoptimized={banner.startsWith('data:')} />
                                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                                <div className="absolute inset-0 px-5 flex items-center gap-3">
                                    <div 
                                        className="p-2.5 rounded-full backdrop-blur-md border border-white/10 text-white shadow-xl"
                                        style={{ backgroundColor: baseColor }}
                                    >
                                        <LeagueIcon className="h-4 w-4" />
                                    </div>
                                    <div className="flex flex-col justify-center overflow-hidden">
                                        <p className="text-sm md:text-base font-headline text-white uppercase tracking-tighter truncate leading-none mb-0.5">{leagueInfo.name}</p>
                                        <div className="flex items-center gap-1.5">
                                            <div 
                                                className="h-1 w-1 rounded-full animate-pulse" 
                                                style={{ backgroundColor: baseColor }}
                                            />
                                            <p className="text-[8px] md:text-[9px] text-white/60 font-bold uppercase tracking-widest">{playerCount} ЧЕЛ.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
            
            <div className="w-full">
                {/* Desktop View: Always Open List */}
                <div className="hidden md:block space-y-24">
                    {enabledLeagues.map((leagueId, index) => (
                        <section 
                            key={leagueId} 
                            id={`league-${leagueId}`} 
                            className="scroll-mt-24 border-b border-white/5 last:border-0 pb-20"
                        >
                            <div className="flex items-center gap-4 mb-10">
                                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/20" />
                                <h2 className="text-3xl font-headline uppercase tracking-tighter text-primary/80">
                                    {leagueSettings[leagueId].name}
                                </h2>
                                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/20" />
                            </div>
                            <LeagueSection 
                                leagueId={leagueId}
                                leagueInfo={leagueSettings[leagueId]}
                                players={rankings[index] || []}
                                scoringSettings={allScoringSettings[leagueId]}
                                sponsorshipSettings={sponsorshipSettings}
                            />
                        </section>
                    ))}
                </div>

                {/* Mobile View: Accordion (Shutter) */}
                <div className="md:hidden">
                    {isClient ? (
                        <Accordion type="single" collapsible className="space-y-6">
                            {enabledLeagues.map((leagueId, index) => {
                                const leagueInfo = leagueSettings[leagueId];
                                const baseColor = getLeagueBaseColor(leagueId);
                                const LeagueIcon = leagueIcons[leagueId] || Target;

                                return (
                                    <AccordionItem 
                                        key={leagueId} 
                                        value={leagueId} 
                                        id={`league-${leagueId}`}
                                        className="border-0 rounded-[2.5rem] glassmorphism overflow-hidden transition-all duration-500 group relative shadow-2xl"
                                    >
                                        <AccordionTrigger className="px-6 py-8 hover:no-underline interactive-scale relative [&>svg]:hidden">
                                            <div className="flex items-center justify-between w-full">
                                                <div className="flex items-center gap-4">
                                                    <div 
                                                        className="p-3.5 rounded-2xl border border-white/10 shadow-lg text-white"
                                                        style={{ backgroundColor: baseColor }}
                                                    >
                                                        <LeagueIcon className="h-6 w-6" />
                                                    </div>
                                                    <div className="flex flex-col items-start">
                                                        <span className="font-headline text-2xl leading-none text-white tracking-tighter uppercase">
                                                            {leagueInfo.name}
                                                        </span>
                                                        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-1">Раскрыть результаты</p>
                                                    </div>
                                                </div>
                                                <div className="bg-primary/10 p-2.5 rounded-full border border-primary/20 shadow-inner">
                                                    <Sparkles className="h-5 w-5 text-primary group-data-[state=open]:animate-spin" />
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="bg-black/40 border-t border-white/5 animate-in slide-in-from-top-2 duration-500 p-4">
                                            <LeagueSection 
                                                leagueId={leagueId}
                                                leagueInfo={leagueInfo}
                                                players={rankings[index] || []}
                                                scoringSettings={allScoringSettings[leagueId]}
                                                sponsorshipSettings={sponsorshipSettings}
                                            />
                                        </AccordionContent>
                                    </AccordionItem>
                                );
                            })}
                        </Accordion>
                    ) : (
                        <div className="space-y-6">
                            {enabledLeagues.map(leagueId => (
                                <div key={leagueId} className="h-24 rounded-[2.5rem] bg-card/50 border border-white/5 animate-pulse" />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
