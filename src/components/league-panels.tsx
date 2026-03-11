'use client';

import { useRouter } from 'next/navigation';
import type { LeagueId, Player, AllLeagueSettings, ScoringSettings, SponsorshipSettings, Partner } from '@/lib/types';
import { LeaderboardHero } from '@/components/leaderboard-hero';
import { PlayerRankings } from '@/components/player-rankings';
import { cn } from '@/lib/utils';
import { 
    Target, 
    Sunset, 
    Sparkles, 
    Wallet, 
    Award, 
    ShieldCheck, 
    Trophy, 
    CircleUser, 
    Loader2, 
    BarChart2, 
    ChevronsUp, 
    Diamond, 
    Users, 
    Baby,
    Info
} from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import Image from 'next/image';
import { Button } from './ui/button';
import { useIsClient } from '@/hooks/use-is-client';
import { ScoringHelpDialog } from './scoring-help-dialog';
import { useTransition, useMemo } from 'react';
import { PartnersDisplay } from './partners-display';

interface LeaguePanelsProps {
  enabledLeagues: LeagueId[];
  leagueSettings: AllLeagueSettings;
  currentLeagueRankings: Player[];
  currentLeagueId: LeagueId;
  allScoringSettings: Record<LeagueId, ScoringSettings>;
  sponsorshipSettings: SponsorshipSettings;
  partners: Partner[];
  playerCounts?: Record<string, number>;
}

const DEFAULT_BANNER = 'https://picsum.photos/seed/darts-league/600/200';

const leagueIcons: Record<string, any> = {
    general: Trophy,
    evening_omsk: Sunset,
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

const getLeagueBaseColor = (leagueId: LeagueId) => {
    const colors: Record<string, string> = {
        general: 'rgba(6, 182, 212, 0.8)',
        evening_omsk: 'rgba(249, 115, 22, 0.8)',
        premier: 'rgba(59, 130, 246, 0.8)',
        first: 'rgba(245, 158, 11, 0.8)',
        second: 'rgba(139, 92, 246, 0.8)',
        third: 'rgba(16, 185, 129, 0.8)',
        fourth: 'rgba(236, 72, 153, 0.8)',
        cricket: 'rgba(34, 197, 94, 0.8)',
        senior: 'rgba(71, 85, 105, 0.8)',
        youth: 'rgba(163, 230, 53, 0.8)',
        women: 'rgba(217, 70, 239, 0.8)',
    };
    return colors[leagueId] || colors.general;
}

function LeagueSection({ 
    leagueId, 
    players, 
    scoringSettings, 
    sponsorshipSettings,
    leagueInfo 
}: { 
    leagueId: LeagueId, 
    players: Player[], 
    scoringSettings: ScoringSettings, 
    sponsorshipSettings: SponsorshipSettings,
    leagueInfo: any
}) {
    const activePlayers = players.filter(p => p.matchesPlayed > 0);
    const topPlayers = activePlayers.filter(p => p.rank > 0 && p.rank <= 3).sort((a, b) => a.rank - b.rank);
    const banner = leagueInfo.bannerUrl || DEFAULT_BANNER;
    const LeagueIcon = leagueIcons[leagueId] || Trophy;

    return (
        <div className="space-y-12 md:space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* UNIFIED LEAGUE HERO SECTION */}
            <div className="relative group overflow-hidden rounded-[3rem] border-2 border-white/5 shadow-2xl transition-all hover:border-primary/20">
                <div className="absolute inset-0 z-0">
                    <Image src={banner} alt="" fill className="object-cover opacity-30 transition-transform duration-[10s] group-hover:scale-110" unoptimized={banner.startsWith('data:')} />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
                </div>
                
                <div className="relative z-10 p-8 md:p-16 flex flex-col lg:flex-row items-center gap-8 md:gap-12">
                    <div className="bg-primary/20 p-8 rounded-[2.5rem] border-2 border-primary/30 shadow-[0_0_50px_rgba(var(--primary-rgb),0.2)] group-hover:rotate-3 transition-transform duration-500">
                        <LeagueIcon className="h-12 w-12 md:h-20 md:w-20 text-primary" />
                    </div>
                    
                    <div className="flex-1 text-center lg:text-left space-y-6">
                        <div className="space-y-2">
                            <div className="flex items-center justify-center lg:justify-start gap-3">
                                <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">Official League Structure</span>
                            </div>
                            <h3 className="text-4xl md:text-7xl font-headline uppercase tracking-tighter text-white text-glow-white drop-shadow-2xl">
                                {leagueInfo.name}
                            </h3>
                        </div>

                        <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                            <ScoringHelpDialog settings={scoringSettings} leagueName={leagueInfo.name} sponsorshipSettings={sponsorshipSettings}>
                                <Button className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-3 shadow-xl interactive-scale bg-white/5 hover:bg-white/10 border border-white/10 text-white">
                                    <Info className="h-4 w-4" />
                                    Посмотреть регламент
                                </Button>
                            </ScoringHelpDialog>
                            
                            {leagueId === 'evening_omsk' && (
                                <div className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 shadow-xl">
                                    <Wallet className="h-5 w-5" />
                                    <span className="font-headline text-lg">{scoringSettings?.exchangeRate || 7} ₽ <span className="text-[8px] opacity-50 uppercase tracking-widest ml-1">За балл</span></span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {activePlayers.length > 0 ? (
                <div className="space-y-16">
                    {topPlayers.length > 0 && <LeaderboardHero players={topPlayers} />}
                    <PlayerRankings players={activePlayers} leagueId={leagueId} />
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 md:py-48 glassmorphism rounded-[4rem] border-2 border-dashed border-primary/25 text-center px-12 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
                    <div className="relative z-10 space-y-8">
                        <div className="p-12 rounded-[3rem] bg-primary/10 mb-4 ring-[12px] ring-primary/5 inline-block group-hover:scale-110 transition-all duration-700 shadow-3xl">
                            <Target className="h-20 w-20 text-primary/30" />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-3xl md:text-5xl font-headline text-muted-foreground/30 uppercase tracking-tighter">ОЖИДАНИЕ ТУРНИРА</h3>
                            <p className="text-lg text-muted-foreground/60 max-w-xl mx-auto italic font-medium">Первый импорт данных для лиги {leagueInfo.name} наполнит эту таблицу результатами.</p>
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
    partners,
    playerCounts = {}
}: LeaguePanelsProps) {
    const router = useRouter();
    const isClient = useIsClient();
    const [isPending, startTransition] = useTransition();
    
    const orderedLeagues = useMemo(() => {
        const sorted = [...enabledLeagues];
        const activeIdx = sorted.indexOf(currentLeagueId);
        if (activeIdx > -1) {
            const [active] = sorted.splice(activeIdx, 1);
            sorted.unshift(active);
        }
        return sorted;
    }, [enabledLeagues, currentLeagueId]);

    const handleLeagueSelect = (leagueId: LeagueId) => {
        if (leagueId === currentLeagueId) return;
        startTransition(() => {
            router.push(`/?league=${leagueId}`, { scroll: false });
        });
    };

    if (!isClient) {
        return (
            <div className="space-y-12">
                <div className="h-32 w-full bg-muted/20 rounded-[2.5rem] animate-pulse" />
                <Skeleton className="h-[800px] w-full rounded-[4rem]" />
            </div>
        );
    }

    const currentScoring = allScoringSettings[currentLeagueId];
    const currentLeagueInfo = leagueSettings[currentLeagueId];

    return (
        <div className="w-full space-y-10">
            {/* Sticky Header Section */}
            <div className="sticky top-16 md:top-20 z-40 bg-background/95 backdrop-blur-3xl border-b border-white/10 -mx-4 px-4 py-4 space-y-4 shadow-[0_20px_60px_rgba(0,0,0,0.4)] transition-all">
                <div className="w-full">
                    <PartnersDisplay partners={partners} variant="compact" hideLabel />
                </div>

                {/* ДЕСКТОП: Сетка карточек */}
                <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 animate-in fade-in duration-500">
                    {orderedLeagues.map((leagueId) => {
                        const leagueInfo = leagueSettings[leagueId];
                        const isSelected = currentLeagueId === leagueId;
                        const banner = leagueInfo.bannerUrl || DEFAULT_BANNER;
                        const LeagueIcon = leagueIcons[leagueId] || Target;
                        const baseColor = getLeagueBaseColor(leagueId);
                        const playerCount = playerCounts[leagueId] || 0;

                        return (
                            <div
                                key={leagueId}
                                role="button"
                                tabIndex={0}
                                onClick={() => handleLeagueSelect(leagueId)}
                                className={cn(
                                    'relative h-14 rounded-xl overflow-hidden transition-all duration-500 transform cursor-pointer outline-none border shadow-lg group',
                                    isSelected 
                                        ? 'border-primary ring-2 ring-primary/20 scale-[1.02] z-10 shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] animate-shimmer' 
                                        : 'border-white/5 opacity-70 hover:opacity-100 hover:border-primary/40'
                                )}
                            >
                                <Image src={banner} alt="" fill className="object-cover transition-all duration-1000 group-hover:scale-110" unoptimized={banner.startsWith('data:')} />
                                <div className={cn(
                                    "absolute inset-0 bg-gradient-to-r transition-opacity duration-700",
                                    isSelected ? "from-black/95 via-black/80 to-transparent" : "from-black/90 via-black/70 to-transparent"
                                )} />
                                <div className="absolute inset-0 px-3 flex items-center gap-3">
                                    <div className="relative">
                                        <div 
                                            className={cn(
                                                "p-1.5 rounded-lg backdrop-blur-xl border border-white/20 text-white shadow-2xl transition-all duration-700",
                                                isSelected && "scale-110 rotate-[360deg] border-white/40"
                                            )}
                                            style={{ backgroundColor: baseColor }}
                                        >
                                            {isPending && isSelected ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <LeagueIcon className="h-4 w-4" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-center overflow-hidden">
                                        <p className="text-[11px] font-headline text-white uppercase tracking-tight truncate leading-none mb-1">
                                            {leagueInfo.name}
                                        </p>
                                        {isSelected && (
                                            <div className="flex items-center gap-1">
                                                <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                                                <p className="text-[7px] text-primary font-black uppercase tracking-[0.2em]">В ЭФИРЕ</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* МОБИЛЬНЫЙ: Стопка закладок */}
                <div className="flex md:hidden overflow-x-auto no-scrollbar pt-6 pb-2 px-4 items-end h-32 mask-fade-edges">
                    {enabledLeagues.map((leagueId, idx) => {
                        const leagueInfo = leagueSettings[leagueId];
                        const isSelected = currentLeagueId === leagueId;
                        const banner = leagueInfo.bannerUrl || DEFAULT_BANNER;
                        const LeagueIcon = leagueIcons[leagueId] || Target;
                        const baseColor = getLeagueBaseColor(leagueId);
                        
                        return (
                            <div
                                key={leagueId}
                                role="button"
                                onClick={() => handleLeagueSelect(leagueId)}
                                className={cn(
                                    "relative flex-shrink-0 w-24 h-24 rounded-t-[2rem] transition-all duration-500 ease-out border-x border-t shadow-2xl",
                                    "-ml-12 first:ml-0 cursor-pointer overflow-hidden",
                                    isSelected 
                                        ? "z-50 -translate-y-4 scale-110 mx-2 border-primary ring-2 ring-primary/20 shadow-[0_10px_30px_rgba(var(--primary-rgb),0.4)]" 
                                        : "z-[var(--z-idx)] border-white/10 grayscale-[0.4] opacity-80"
                                )}
                                style={{ 
                                    '--z-idx': isSelected ? 100 : (enabledLeagues.length - idx),
                                    backgroundColor: baseColor 
                                } as React.CSSProperties}
                            >
                                <Image src={banner} alt="" fill className="object-cover" unoptimized={banner.startsWith('data:')} />
                                <div className={cn(
                                    "absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent",
                                    isSelected ? "opacity-40" : "opacity-80"
                                )} />
                                
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center">
                                    <div className={cn(
                                        "p-2 rounded-lg backdrop-blur-xl border transition-all duration-700 shadow-2xl mb-1",
                                        isSelected ? "bg-primary text-primary-foreground border-white/40 scale-110" : "bg-black/40 text-white border-white/10"
                                    )}>
                                        {isPending && isSelected ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <LeagueIcon className="h-4 w-4" />
                                        )}
                                    </div>
                                    <span className={cn(
                                        "text-[8px] font-headline uppercase leading-tight line-clamp-2 px-1",
                                        isSelected ? "text-primary" : "text-white/80"
                                    )}>
                                        {leagueInfo.name}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            
            <div className="w-full relative pt-2">
                {isPending && (
                    <div className="absolute inset-0 z-10 bg-background/30 backdrop-blur-[2px] transition-all duration-500 pointer-events-none" />
                )}
                <section key={currentLeagueId} className="animate-in fade-in slide-in-from-top-4 duration-1000">
                    <LeagueSection 
                        leagueId={currentLeagueId}
                        players={currentLeagueRankings}
                        scoringSettings={currentScoring}
                        sponsorshipSettings={sponsorshipSettings}
                        leagueInfo={currentLeagueInfo}
                    />
                </section>
            </div>
        </div>
    );
}
